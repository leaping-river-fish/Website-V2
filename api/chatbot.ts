import mongoose from "mongoose";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import AboutMe from "../backend/src/AboutMe"; 
import Chat from "../backend/src/Chat"; 
import { redisClient } from "../backend/src/redis";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
});

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI || "")
        .then(() => console.log("✔ MongoDB connected"))
        .catch(err => console.error("MongoDB connection error:", err));
}

function cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magA && magB ? dot / (magA * magB) : 0;
}

async function getEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
}

async function getRedisMemory(userId: string) {
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

async function rateLimit(userId: string, limit = 10, windowSec = 60) {
    const key = `rate:${userId}:${windowSec}`;
    const count = await redisClient.incr(key);

    if (count === 1) await redisClient.expire(key, windowSec);
    return count <= limit;
}

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const userId = "default-user";

        const minuteAllowed = await rateLimit(userId, 8, 60);
        const hourAllowed = await rateLimit(userId, 40, 3600);

        if (!minuteAllowed || !hourAllowed) {
            return res.status(429).json({
                output: {
                role: "assistant",
                content: !minuteAllowed
                    ? "Let’s slow things down a bit 🙂"
                    : "You’ve reached the hourly limit — try again later.",
                },
            });
        }

        const { chats } = req.body;
        const lastUserMessage = chats?.slice().reverse().find((m: any) => m.role === "user")?.content;
        if (!lastUserMessage) return res.status(400).json({ error: "No user message found" });

        const normalizedMessage = lastUserMessage.trim().toLowerCase();

        const greetingRegex = /^(hi|hello|hey|yo|sup|greetings|wassup)[.!]?$/i;
        if (greetingRegex.test(normalizedMessage)) {
            const greetings = [
                "Hey! 👋 What would you like to know about Nick?",
                "Hi there! I can tell you all about Nick — what are you curious about?",
                "Hello! Ask me anything about Nick.",
                "Hey! Happy to help — what do you want to know?",
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            return res.json({ output: { role: "assistant", content: randomGreeting } });
        }

        const redisTTL = parseInt(process.env.REDIS_CACHE_TTL || "3600", 10);

        const { redisKey, memoryMap } = await getRedisMemory(userId);
        if (memoryMap[normalizedMessage]) {
            return res.json({ output: { role: "assistant", content: memoryMap[normalizedMessage] } });
        }

        const userEmbedding = await getEmbedding(lastUserMessage);

        const [aboutMes, chatsData] = await Promise.all([AboutMe.find({}), Chat.find({})]);

        const allEntries: { question: string; text: string; sim: number }[] = [];

        aboutMes.forEach(f => {
            if (f.embedding) {
                allEntries.push({ question: f.question, text: f.answer, sim: cosineSimilarity(userEmbedding, f.embedding) });
            }
        });
        chatsData.forEach(f => {
            if (f.embedding) {
                allEntries.push({ question: f.question, text: f.answer, sim: cosineSimilarity(userEmbedding, f.embedding) });
            }
        });

        const similarityThreshold = lastUserMessage.trim().split(/\s+/).length < 6 ? 0.65 : 0.75;
        const directMatch = allEntries.filter(e => e.sim >= similarityThreshold)
            .sort((a, b) => b.sim - a.sim)[0];

        if (directMatch) {
            await redisClient.rpush(redisKey, JSON.stringify({ user: lastUserMessage, bot: directMatch.text, timestamp: Date.now() }));
            await redisClient.expire(redisKey, redisTTL);
            return res.json({ output: { role: "assistant", content: directMatch.text } });
        }

        const topFactsForRAG = allEntries.sort((a, b) => b.sim - a.sim).slice(0, 3).map(f => f.text);
        const systemPrompt = `
            You are Lumie, a friendly AI assistant who helps users learn about Nick.

            Rules:
            - Use ONLY the facts provided
            - If facts do not contain the answer, say: "It looks like Nick hasn’t shared that information yet."

            Facts:
            ${topFactsForRAG.join("\n")}
            `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.8,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: lastUserMessage },
            ],
        });

        let answer = completion.choices[0].message?.content?.trim() || "It looks like Nick hasn’t shared that information yet.";

        await Chat.updateOne(
            { question: lastUserMessage },
            { $setOnInsert: { answer, embedding: userEmbedding } },
            { upsert: true }
        );

        await redisClient.rpush(redisKey, JSON.stringify({ user: lastUserMessage, bot: answer, timestamp: Date.now() }));
        await redisClient.expire(redisKey, redisTTL);

        res.json({ output: { role: "assistant", content: answer } });

    } catch (err: any) {
        console.error("Chatbot error:", err.stack || err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


