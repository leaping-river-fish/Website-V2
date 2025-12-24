import AnonymousProfile from "../schema/AnonymousProfile.js";

export async function identify(req, res) {
    try {
        const { anonId } = req.body || {};
        if (!anonId) return res.status(400).json({ error: "Missing anonId" });

        res.cookie("anon_id", anonId, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            path: "/",
        });

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        const profile = await AnonymousProfile.findOneAndUpdate(
            { anonId, env }, 
            {
                $setOnInsert: { createdAt: new Date() },
                $set: { lastSeen: new Date() },
            }, 
            { upsert: true, new: true } 
        );

        res.json({
            ok: true,
            profile: {
                anonId: profile.anonId,
                introGameCompleted: profile.introGameCompleted,
                quests: profile.quests,
            },
        });
    } catch (err) {
        console.error("Error in /api/identify:", err);
        res.status(500).json({ error: err.message });
    }
}

