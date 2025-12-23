import cookie from "cookie";
import { connectMongo } from "./models/mongodb";
import AnonymousProfile from "./models/AnonymousProfile";

interface IdentifyRequest {
    body?: { anonId?: string };
    headers?: Record<string, string>;
}

interface IdentifyResponse {
    status: (code: number) => IdentifyResponse;
    json: (data: any) => void;
    setHeader: (name: string, value: string) => void;
}

export default async function identify(req: IdentifyRequest, res: IdentifyResponse) {
    try {
        await connectMongo();

        const { anonId } = req.body || {};
        if (!anonId) return res.status(400).json({ error: "Missing anonId" });

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        res.setHeader("Set-Cookie", cookie.serialize("anon_id", String(anonId), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        }));

        const profile = await AnonymousProfile.findOneAndUpdate(
            { anonId, env },
            { $setOnInsert: { createdAt: new Date() }, $set: { lastSeen: new Date() } },
            { upsert: true, new: true }
        );

        res.status(200).json({
            ok: true,
            profile: {
                anonId: profile.anonId,
                introGameCompleted: profile.introGameCompleted,
                quests: profile.quests,
            },
        });
    } catch (err) {
        console.error("Identify error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}