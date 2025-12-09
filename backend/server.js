import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

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