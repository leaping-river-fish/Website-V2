import { OpenAI } from "openai";
import AboutMe from "../models/AboutMe";
import Chat from "../models/Chat";
import Profile from "../models/Profile";
import { connectMongo } from "../models/mongodb";
import { redisClient } from "../models/redis";
import type { IncomingMessage, ServerResponse } from "http";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
});

function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magA && magB ? dot / (magA * magB) : 0;
}

async function getEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
}

async function getRedisMemory(userId: string): Promise<{ redisKey: string; memoryMap: Record<string, string> }> {
    const redisKey = `chat_history:${userId}`;
    const list = await redisClient.lrange(redisKey, 0, -1);
    const memoryMap: Record<string, string> = {};

    list.forEach(item => {
        try {
            const entry = JSON.parse(item);
            memoryMap[entry.user.trim().toLowerCase()] = entry.bot;
        } catch {}
    });

    return { redisKey, memoryMap };
}

async function rateLimit(userId: string, limit = 10, windowSec = 60): Promise<boolean> {
    const key = `rate:${userId}:${windowSec}`;
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, windowSec);
    return count <= limit;
}

let cachedProfile: ProfileType | null = null;

async function getProfile(): Promise<ProfileType | null> {
    if (cachedProfile !== null) return cachedProfile;

    const profileDoc = await Profile.findOne({ name: "Nick Zheng" }).lean<ProfileType>();
    cachedProfile = profileDoc ?? null;

    if (!cachedProfile) {
        console.warn("⚠ No profile found — running without structured validation");
    }

    return cachedProfile;
}

function contradictsProfile(answer: string, profile: ProfileType | null): boolean {
    if (!profile) return false;

    const text = answer.toLowerCase();

    if (profile.location?.city && text.includes("from") &&
        !text.includes(profile.location.city.toLowerCase())) {
        return true;
    }

    if (profile.goals?.fiveYear?.role && text.includes("works as") &&
        !text.includes(profile.goals.fiveYear.role.toLowerCase())) {
        return true;
    }

    return false;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequestBody {
    chats?: ChatMessage[];
}

interface ProfileType {
    name: string;
    location?: {
        city?: string;
        province?: string;
        country?: string;
    };
    goals?: {
        fiveYear?: {
            role?: string;
            industries?: string[];
        };
    };
    // Add other fields as needed if you plan to use them
}

export default async function handler(req: IncomingMessage & { body?: ChatRequestBody }, res: ServerResponse) {
    const sendJSON = (status: number, data: object) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    };

    if (req.method !== "POST") return sendJSON(405, { error: "Method not allowed" });

    try {
        await connectMongo();
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        return sendJSON(500, { error: "Database connection failed" });
    }

    let body: ChatRequestBody | undefined;
    try {
        let raw = "";
        await new Promise<void>((resolve, reject) => {
            req.on("data", chunk => raw += chunk);
            req.on("end", () => resolve());
            req.on("error", err => reject(err));
        });

        if (raw) {
            body = JSON.parse(raw);
            console.log("✅ Parsed request body:", body);
        } else {
            console.warn("⚠ Empty request body");
        }
    } catch (err) {
        console.error("❌ Error parsing request body:", err);
        return sendJSON(400, { error: "Invalid JSON" });
    }
    
    try {
        // CHANGED
        let profile: ProfileType | null = null;
        try {
            profile = await getProfile();
            if (!profile) console.warn("⚠ Profile is null");
        } catch (err) {
            console.error("❌ Failed to get profile:", err);
            return sendJSON(500, { error: "Could not load profile" });
        }

        const userId = "default-user";

        const minuteAllowed = await rateLimit(userId, 8, 60);
        const hourAllowed = await rateLimit(userId, 40, 3600);

        if (!minuteAllowed || !hourAllowed) {
            const message = !minuteAllowed
                ? "Let’s slow things down a bit 🙂"
                : "You’ve reached the hourly limit — try again later.";
            return sendJSON(429, { output: { role: "assistant", content: message } });
        }

        const lastUserMessage = req.body?.chats?.slice().reverse().find(m => m.role === "user")?.content;
        if (!lastUserMessage) return sendJSON(400, { error: "No user message found" });

        const normalizedMessage = lastUserMessage.trim().toLowerCase();

        const greetingRegex = /^(hi|hello|hey|yo|sup|greetings|wassup)[.!]?$/i;
        const greetings = [
            "Hey! 👋 What would you like to know about Nick?",
            "Hi there! I can tell you all about Nick — what are you curious about?",
            "Hello! Ask me anything about Nick.",
            "Hey! Happy to help — what do you want to know?"
        ];

        if (greetingRegex.test(normalizedMessage)) {
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            return sendJSON(200, { output: { role: "assistant", content: randomGreeting } });
        }

        // CHANGED
        const redisTTL = parseInt(process.env.REDIS_CACHE_TTL || "3600", 10);
        let redisData: { redisKey: string; memoryMap: Record<string, string> } = { redisKey: "", memoryMap: {} };
        try {
            redisData = await getRedisMemory(userId);
        } catch (err) {
            console.error("❌ Redis fetch failed:", err);
        }
        const { redisKey, memoryMap } = redisData;

        if (memoryMap[normalizedMessage]) {
            return sendJSON(200, { output: { role: "assistant", content: memoryMap[normalizedMessage] } });
        }

        // CHANGED
        let userEmbedding: number[] = [];
        try {
            userEmbedding = await getEmbedding(lastUserMessage);
        } catch (err) {
            console.error("❌ OpenAI embedding failed:", err);
            return sendJSON(500, { error: "Failed to generate embedding" });
        }

        // CHANGED
        let aboutMes: any[] = [];
        let chatsData: any[] = [];
        try {
            [aboutMes, chatsData] = await Promise.all([AboutMe.find({}), Chat.find({})]);
            console.log(`✅ Retrieved ${aboutMes.length} AboutMe and ${chatsData.length} Chat entries`);
        } catch (err) {
            console.error("❌ DB fetch failed:", err);
            return sendJSON(500, { error: "Database fetch error" });
        }

        // CHANGED
        type Entry = { question: string; text: string; sim: number; source: "aboutMe" | "chat"; };
        const allEntries: Entry[] = [];

        try {
            aboutMes.forEach(f => {
                if (f.embedding) {
                    const sim = cosineSimilarity(userEmbedding, f.embedding) * (f.confidence ?? 1.0);
                    allEntries.push({ question: f.question, text: f.answer, sim, source: "aboutMe" });
                }
            });
            chatsData.forEach(c => {
                if (c.embedding) {
                    const sim = cosineSimilarity(userEmbedding, c.embedding) * (c.confidence ?? 0.5);
                    allEntries.push({ question: c.question, text: c.answer, sim, source: "chat" });
                }
            });
            console.log(`✅ Computed similarities for ${allEntries.length} entries`);
        } catch (err) {
            console.error("❌ Similarity calculation failed:", err);
            return sendJSON(500, { error: "Similarity calculation error" });
        }

        const sortedEntries = [...allEntries].sort((a, b) => b.sim - a.sim);

        const similarityThreshold = lastUserMessage.trim().split(/\s+/).length < 6 ? 0.65 : 0.75;

        const directMatch = sortedEntries.find(e => e.sim >= similarityThreshold);

        const hasDirectMatch = Boolean(directMatch);

        // CHANGED
        if (directMatch) {
            console.log(`Direct match found! Question: "${directMatch.question}" | Similarity: ${directMatch.sim.toFixed(4)}`);
            try {
                await redisClient.rpush(redisKey, JSON.stringify({ user: lastUserMessage, bot: directMatch.text, timestamp: Date.now() }));
                await redisClient.expire(redisKey, redisTTL);
            } catch (err) {
                console.error("❌ Redis caching failed:", err);
            }
            return sendJSON(200, { output: { role: "assistant", content: directMatch.text } });
        }

        const topFactsForRAG = sortedEntries.slice(0, 3).map(e => e.text);
        const contextString = topFactsForRAG.map(f => `Fact: ${f}`).join("\n");

        const systemPrompt = `
            You are Lumie, a friendly and approachable AI assistant who helps users learn about Nick.

            Tone & style:
            - Warm, conversational, and human
            - Confident but not overly formal
            - Concise and clear
            - No emojis unless the user uses them first

            Rules:
            - Use ONLY the facts provided below
            - Do NOT invent or assume information
            - If multiple facts are relevant, combine them naturally without adding new information
            - If the facts do not contain the answer, say:
            "It looks like Nick hasn’t shared that information yet."

            Facts:
            ${contextString}
                `;
        
        // CHANGED
        let answer = "It looks like Nick hasn’t shared that information yet.";
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0.8,
                presence_penalty: 0.4,
                frequency_penalty: 0.2,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: lastUserMessage }
                ]
            });
            answer = completion.choices[0].message?.content?.trim() || answer;
            console.log("✅ OpenAI completion received");
        } catch (err) {
            console.error("❌ OpenAI completion failed:", err);
            return sendJSON(500, { error: "OpenAI completion error" });
        }

        try {
            if (contradictsProfile(answer, profile)) {
                console.warn("⚠ Chat answer contradicts profile — not saved");
            } else if (!hasDirectMatch) {
                await Chat.updateOne(
                    { question: lastUserMessage },
                    {
                        $setOnInsert: {
                            answer,
                            embedding: userEmbedding,
                            source: "conversation",
                            confidence: 0.5,
                        },
                    },
                    { upsert: true }
                );
            }
        } catch (err) {
            console.error("Error saving chat:", err);
        }

        // CHANGED
        try {
            await redisClient.rpush(redisKey, JSON.stringify({ user: lastUserMessage, bot: answer, timestamp: Date.now() }));
            await redisClient.expire(redisKey, redisTTL);
        } catch (err) {
            console.error("❌ Redis caching of final answer failed:", err);
        }

        sendJSON(200, { output: { role: "assistant", content: answer } });
    } catch (err: any) {
        console.error("Chatbot error:", err.stack || err);
        sendJSON(500, { error: "Internal Server Error" });
    }
}


