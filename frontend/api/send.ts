import nodemailer from 'nodemailer';
import type { IncomingMessage, ServerResponse } from "http";

interface ContactFormBody {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default async function handler(
    req: IncomingMessage & { body?: ContactFormBody },
    res: ServerResponse
) {
    const sendJSON = (status: number, data: object) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    };

    if (req.method !== 'POST') {
        return sendJSON(405, { error: "Method not allowed" });
    }

    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
        return sendJSON(400, { error: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
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
        sendJSON(200, { message: "Email sent successfully!" });
    } catch (error) {
        console.error('❌ Gmail SMTP error:', error);
        sendJSON(500, { error: "Failed to send email. Check server logs." });
    }
}

export const config = {
    runtime: "nodejs",
};