import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import nodemailer from "nodemailer";
import { v2 as cloudinary } from 'cloudinary';
import { router as chatbotRouter } from "./src/chatbot.js";
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

const PORT = 5000;

{/* Image get for gallery */}
app.get("/api/getImages", async (req, res) => {
    try {
        const category = req.query.category;

        if (!category) {
            return res.status(400).json({ error: "Category is required" });
        }

        const result = await cloudinary.search
            .expression(`tags=${category}`)
            .sort_by("created_at", "desc")
            .max_results(40)
            .execute();

        const images = result.resources.map(img => ({
            src: img.secure_url,
            alt: img.public_id,
            category
        }));

        res.json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Error fetching images" });
    }
});

{/* Project get for projects */}
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

{/* Email post for contact */}
app.post("/api/send", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: `New Contact Form Submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email. Check server logs." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});