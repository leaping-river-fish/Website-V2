import mongoose from "mongoose";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import AboutMe from "./AboutMe.js";
import Chat from "./Chat.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORGANIZATION,
});

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " ")
  });
  return response.data[0].embedding;
}

async function reseedEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✔ MongoDB connected");

    // Update AboutMe embeddings
    const aboutMes = await AboutMe.find({});
    for (const item of aboutMes) {
      const embedding = await getEmbedding(item.question);
      item.embedding = embedding;
      await item.save();
      console.log(`Updated AboutMe: "${item.question}"`);
    }

    // Update Chat embeddings
    const chats = await Chat.find({});
    for (const chat of chats) {
      const embedding = await getEmbedding(chat.question);
      chat.embedding = embedding;
      await chat.save();
      console.log(`Updated Chat: "${chat.question}"`);
    }

    console.log("✅ All embeddings reseeded!");
    process.exit(0);
  } catch (err) {
    console.error("Error reseeding embeddings:", err);
    process.exit(1);
  }
}

reseedEmbeddings();