import cookie from "cookie";
import { connectMongo } from "./models/mongodb";
import AnonymousProfile from "./models/AnonymousProfile";

interface IdentifyRequest {
    body?: { anonId?: string };
    headers?: Record<string, string>;
}


export default async function identify(req: IdentifyRequest) {
    try {
        await connectMongo();

        const { anonId } = req.body || {};
        if (!anonId) {
            return new Response(JSON.stringify({ error: "Missing anonId" }), { status: 400 });
        }

        const cookieHeader = cookie.serialize("anon_id", String(anonId), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        const profile = await AnonymousProfile.findOneAndUpdate(
            { anonId },
            { $setOnInsert: { createdAt: new Date() }, $set: { lastSeen: new Date() } },
            { upsert: true, new: true }
        );

        return new Response(
            JSON.stringify({
                ok: true,
                profile: {
                    anonId: profile.anonId,
                    introGameCompleted: profile.introGameCompleted,
                    quests: profile.quests,
                },
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie": cookieHeader,
                },
            }
        );
    } catch (err) {
        console.error("Identify error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}