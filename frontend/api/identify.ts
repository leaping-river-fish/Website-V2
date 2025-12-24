import * as cookie from "cookie";
import { connectMongo } from "../models/mongodb";
import AnonymousProfile from "../models/AnonymousProfile";
import mongoose from "mongoose";

interface IdentifyRequest {
    body?: { anonId?: string };
    headers?: Record<string, string>;
}

export default async function identify(req: IdentifyRequest) {
    try {
        await connectMongo();
        console.log("Mongo connection readyState:", mongoose.connection.readyState);
        
        console.log("Request body:", req.body);
        const { anonId } = req.body || {};
        console.log("Received anonId:", anonId);
        if (!anonId) {
            return new Response(JSON.stringify({ error: "Missing anonId" }), { status: 400 });
        }

        const cookieHeader = cookie.serialize("anon_id", String(anonId), {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        let profile = await AnonymousProfile.findOne({ anonId, env });
        if (!profile) {
            console.log("Profile not found — creating new");
            profile = await AnonymousProfile.create({
                anonId,
                introGameCompleted: false,
                quests: [],
                createdAt: new Date(),
                lastSeen: new Date(),
                env,
            });
        } else {
            console.log("Profile found — updating lastSeen");
            profile.lastSeen = new Date();
            await profile.save();
        }
        console.log("Profile after DB operation:", profile);

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