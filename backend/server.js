import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

const PORT = 5000;

app.get("/api/github-projects", async (req, res) => {
    try {
        const username = "leaping-river-fish";

        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await response.json();

        res.json(repos);
    } catch (error) {
        console.error("Backend GitHub fetch error:", error);
        res.status(500).json({ error: "Failed to fetch GitHub repos" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});