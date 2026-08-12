import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import nodemailer from "nodemailer";
import { v2 as cloudinary } from 'cloudinary';
import { router as chatbotRouter } from "./src/chatbot.js";
import { router as questRouter } from "./src/quests/questRoutes.js";
import { anonUser } from "./src/middleware/anonUser.js";
import anonProfileHandler from "./src/anon-profile.js";
import { connectMongo } from "./src/db/mongodb.js";

const app = express();

app.use(cors({ 
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());
app.use(anonUser);
connectMongo();
app.post("/api/anon-profile", anonProfileHandler);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

{/* chatbot */}
app.use("/api/chatbot", chatbotRouter);

app.use("/api/quests", questRouter);

const PORT = 5000;

{/* Unified fetch endpoint for github and images */}
app.get("/api/fetch", async (req, res) => {
    const { action, category } = req.query;

    if (action === "github") {
        try {
            const username = "leaping-river-fish";
            const response = await fetch(`https://api.github.com/users/${username}/repos`);
            const repos = await response.json();

            if (!Array.isArray(repos)) {
                return res.status(500).json({ error: "Unexpected GitHub API response" });
            }

            const projects = await Promise.all(
                repos
                    // Skip the special GitHub profile README repo (same name as the username)
                    .filter(repo => repo.name && repo.name !== username)
                    .map(async (repo) => {
                        const topicRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
                            headers: {
                                Accept: "application/vnd.github.mercy-preview+json",
                            },
                        });
                        const topicsData = await topicRes.json();
                        const topics = topicsData.names || [];

                        return {
                            id: repo.id,
                            name: repo.name,
                            description: repo.description || "",
                            html_url: repo.html_url,
                            topics,
                        };
                    })
            );

            return res.json(projects);
        } catch (error) {
            console.error("Backend GitHub fetch error:", error);
            return res.status(500).json({ error: "Failed to fetch GitHub repos" });
        }
    }

    if (action === "images") {
        if (!category) {
            return res.status(400).json({ error: "Category is required" });
        }

        try {
            const result = await cloudinary.search
                .expression(`tags="${category}"`)
                .sort_by("created_at", "desc")
                .max_results(40)
                .execute();

            const images = result.resources.map(img => ({
                src: img.secure_url,
                alt: img.public_id,
                category
            }));

            return res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            return res.status(500).json({ error: "Error fetching images" });
        }
    }

    return res.status(400).json({ error: "Invalid action. Use ?action=github or ?action=images&category=..." });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});