import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import AboutMe from "./AboutMe.js";
import Chat from "./Chat.js";
import { redisClient } from "./redis.js";

dotenv.config();

const router = express.Router();
export { router };

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✔ MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

async function getEmbedding(text) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " ")
    });
    return response.data[0].embedding;
}

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magA && magB ? dot / (magA * magB) : 0;
}

async function getRedisMemory(userId) {
    const redisKey = `chat_history:${userId}`;
    let entries = [];

    try {
        const list = await redisClient.lrange(redisKey, 0, -1);
        entries = list
            .map(item => {
                try { return JSON.parse(item); } catch { return null; }
            })
            .filter(Boolean);
    } catch (err) {
        console.error("Redis GET failed:", err.message);
    }

    const memoryMap = {};
    for (const entry of entries) {
        memoryMap[entry.user.trim().toLowerCase()] = entry.bot;
    }

    return { redisKey, memoryMap };
}

// Main chatbot endpoint
router.post("/", async (req, res) => {
    try {
        const userId = "default-user";
        const { chats } = req.body;
        const lastUserMessage = chats?.slice().reverse().find(m => m.role === "user")?.content;
        if (!lastUserMessage) return res.status(400).json({ error: "No user message found" });

        const normalizedMessage = lastUserMessage.trim().toLowerCase();
        const greetingRegex = /^(hi|hello|hey|yo|sup|greetings|wassup|)[.!]?$/i;
        if (greetingRegex.test(normalizedMessage)) {
            return res.json({
                output: {
                    role: "assistant",
                    content: "Hi there! How can I assist you with getting to know Nick today?"
                }
            });
        }

        const redisTTL = parseInt(process.env.REDIS_CACHE_TTL || "3600", 10);

        // 1. Redis exact match
        const { redisKey, memoryMap } = await getRedisMemory(userId);
        if (memoryMap[normalizedMessage]) {
            return res.json({ output: { role: "assistant", content: memoryMap[normalizedMessage] } });
        }

        // 2. Embed user message
        const userEmbedding = await getEmbedding(lastUserMessage);

        // 3. Fetch AboutMe + Chat questions (we compare against questions, not answers)
        const [aboutMes, chatsData] = await Promise.all([AboutMe.find({}), Chat.find({})]);

        const allEntries = [];

        // Compute similarity against questions
        aboutMes.forEach(f => {
            if (f.embedding) {
                const sim = cosineSimilarity(userEmbedding, f.embedding);
                allEntries.push({ question: f.question, text: f.answer, sim });
                console.log(`[AboutMe] Question: "${f.question}" | Similarity: ${sim.toFixed(4)}`);
            }
        });
        chatsData.forEach(c => {
            if (c.embedding) {
                const sim = cosineSimilarity(userEmbedding, c.embedding);
                allEntries.push({ question: c.question, text: c.answer, sim });
                console.log(`[Chat] Question: "${c.question}" | Similarity: ${sim.toFixed(4)}`);
            }
        });

        // 4. Direct return if any entry meets threshold
        const similarityThreshold = lastUserMessage.trim().split(/\s+/).length < 6 ? 0.65 : 0.75;
        const directMatch = allEntries
            .filter(e => e.sim >= similarityThreshold)
            .sort((a, b) => b.sim - a.sim)[0];

        if (directMatch) {
            console.log(`Direct match found! Question: "${directMatch.question}" | Similarity: ${directMatch.sim.toFixed(4)}`);
            const cacheEntry = { user: lastUserMessage, bot: directMatch.text, timestamp: Date.now() };
            await redisClient.rpush(redisKey, JSON.stringify(cacheEntry));
            await redisClient.expire(redisKey, redisTTL);

            return res.json({ output: { role: "assistant", content: directMatch.text } });
        }

        // 5. Always select top 3 facts for RAG context (regardless of similarity)
        const topFactsForRAG = allEntries
            .sort((a, b) => b.sim - a.sim)
            .slice(0, 3)
            .map(f => f.text);

        // 6. OpenAI fallback
        const contextString = topFactsForRAG.map(f => `Fact: ${f}`).join("\n");
        const systemPrompt = `You are Lumie, an AI assistant. Answer the user question using ONLY the following facts. Do NOT hallucinate. If the facts do not contain the answer, respond: 'Seems like Nick did not provide me with that information.'\n\n${contextString}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: lastUserMessage }
            ]
        });

        let answer = completion.choices[0].message.content.trim();

        // 7. Save new chat to MongoDB, ignoring duplicates
        try {
            await Chat.updateOne(
                { question: lastUserMessage },
                { $setOnInsert: { answer, embedding: userEmbedding } },
                { upsert: true }
            );
        } catch (err) {
            console.error("Error saving chat to MongoDB:", err);
        }

        // 8. Save to Redis
        const cacheEntry = { user: lastUserMessage, bot: answer, timestamp: Date.now() };
        await redisClient.rpush(redisKey, JSON.stringify(cacheEntry));
        await redisClient.expire(redisKey, redisTTL);

        res.json({ output: { role: "assistant", content: answer } });

    } catch (err) {
        console.error("Chatbot error:", err.stack || err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



