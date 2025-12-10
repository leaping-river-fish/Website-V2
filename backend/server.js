import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

import { v2 as cloudinary } from 'cloudinary';

const app = express();

app.use(cors({ 
    origin: "http://localhost:5173",
    methods: ["GET"]
}));

app.use(express.json());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = 5000;

app.get("/getImages", async (req, res) => {
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

app.post("/send", async (req, res) => {
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