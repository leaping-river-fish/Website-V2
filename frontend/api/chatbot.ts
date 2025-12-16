import mongoose from "mongoose";
import { OpenAI } from "openai";
import AboutMe from "./models/AboutMe";
import Chat from "./models/Chat";
import { redisClient } from "./models/redis";
import type { IncomingMessage, ServerResponse } from "http";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
});

if (!mongoose.connection.readyState) {
    mongoose
        .connect(process.env.MONGO_URI || "")
        .then(() => console.log("✔ MongoDB connected"))
        .catch((err: any) => console.error("MongoDB connection error:", err));
}

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

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequestBody {
    chats?: ChatMessage[];
}

export default async function handler(req: IncomingMessage & { body?: ChatRequestBody }, res: ServerResponse) {
    const sendJSON = (status: number, data: object) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    };

    if (req.method !== "POST") return sendJSON(405, { error: "Method not allowed" });

    try {
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

        const redisTTL = parseInt(process.env.REDIS_CACHE_TTL || "3600", 10);
        const { redisKey, memoryMap } = await getRedisMemory(userId);

        if (memoryMap[normalizedMessage]) {
            return sendJSON(200, { output: { role: "assistant", content: memoryMap[normalizedMessage] } });
        }

        const userEmbedding = await getEmbedding(lastUserMessage);
        const [aboutMes, chatsData] = await Promise.all([AboutMe.find({}), Chat.find({})]);

        type Entry = { question: string; text: string; sim: number };
        const allEntries: Entry[] = [];

        aboutMes.forEach(f => {
            if (f.embedding) {
                const sim = cosineSimilarity(userEmbedding, f.embedding);
                allEntries.push({ question: f.question, text: f.answer, sim });
                console.log(`[AboutMe] Question: "${f.question}" | Similarity: ${sim.toFixed(4)}`);
            }
        });

        chatsData.forEach(f => {
            if (f.embedding) {
                const sim = cosineSimilarity(userEmbedding, f.embedding);
                allEntries.push({ question: f.question, text: f.answer, sim });
                console.log(`[Chat] Question: "${f.question}" | Similarity: ${sim.toFixed(4)}`);
            }
        });

        const similarityThreshold = lastUserMessage.trim().split(/\s+/).length < 6 ? 0.65 : 0.75;
        const directMatch = allEntries.filter(e => e.sim >= similarityThreshold).sort((a, b) => b.sim - a.sim)[0];

        if (directMatch) {
            console.log(`Direct match found! Question: "${directMatch.question}" | Similarity: ${directMatch.sim.toFixed(4)}`);
            const cacheEntry = { user: lastUserMessage, bot: directMatch.text, timestamp: Date.now() };
            await redisClient.rpush(redisKey, JSON.stringify(cacheEntry));
            await redisClient.expire(redisKey, redisTTL);
            return sendJSON(200, { output: { role: "assistant", content: directMatch.text } });
        }

        const topFactsForRAG = allEntries.sort((a, b) => b.sim - a.sim).slice(0, 3).map(f => f.text);
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
            - If the facts do not contain the answer, say:
            "It looks like Nick hasn’t shared that information yet."

            Facts:
            ${contextString}
                `;

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

        const answer = completion.choices[0].message?.content?.trim() || "It looks like Nick hasn’t shared that information yet.";

        try {
            await Chat.updateOne(
                { question: lastUserMessage },
                { $setOnInsert: { answer, embedding: userEmbedding } },
                { upsert: true }
            );
        } catch (err) {
            console.error("Error saving chat to MongoDB:", err);
        }

        const cacheEntry = { user: lastUserMessage, bot: answer, timestamp: Date.now() };
        await redisClient.rpush(redisKey, JSON.stringify(cacheEntry));
        await redisClient.expire(redisKey, redisTTL);

        sendJSON(200, { output: { role: "assistant", content: answer } });
    } catch (err: any) {
        console.error("Chatbot error:", err.stack || err);
        sendJSON(500, { error: "Internal Server Error" });
    }
}


