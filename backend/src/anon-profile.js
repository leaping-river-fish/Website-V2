import { connectMongo } from "./db/mongodb.js";
import AnonymousProfile from "./schema/AnonymousProfile.js";

export default async function anonProfileHandler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    await connectMongo();

    const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

    const { action } = req.body || {};

    const cookieAnonId = req.cookies?.anon_id;
    const bodyAnonId = req.body?.anonId;
    const anonId = bodyAnonId || cookieAnonId;

    if (!anonId) {
        console.warn("Missing anonId", { bodyAnonId, cookieAnonId });
        return res.status(400).json({ error: "Missing anonId" });
    }


    try {
        if (action === "identify") {

            res.cookie("anon_id", anonId, {
                httpOnly: false,
                sameSite: "lax",
                secure: false,
                maxAge: 1000 * 60 * 60 * 24 * 365, 
                path: "/",
            });

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                {
                    $setOnInsert: { createdAt: new Date() },
                    $set: { lastSeen: new Date() },
                },
                { upsert: true, new: true }
            );

            return res.json({
                ok: true,
                profile: {
                    anonId: profile.anonId,
                    introGameCompleted: profile.introGameCompleted,
                    quests: profile.quests,
                },
            });
        }

        if (action === "complete-intro") {
            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                { introGameCompleted: true },
                { new: true }
            );

            return res.json({ ok: true, profile });
        }

        return res.status(400).json({ error: "Invalid action" });
    } catch (err) {
        console.error("Error in /api/anon-profile:", err);
        return res.status(500).json({ error: err.message });
    }
}
