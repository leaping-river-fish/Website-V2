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

            let needsSave = false;

            if (!profile.ownedCosmetics?.includes("flame:crimson")) {
                profile.ownedCosmetics.push("flame:crimson");
                needsSave = true;
            }

            if (!profile.equipped?.flameTheme) {
                profile.equipped = { flameTheme: "flame:crimson" };
                needsSave = true;
            }

            if (needsSave) {
                await profile.save();
            }

            return res.json({
                ok: true,
                profile: {
                    anonId: profile.anonId,
                    introGameCompleted: profile.introGameCompleted,
                    quests: profile.quests,
                    wallet: profile.wallet ?? { embers: 0, totalEarned: 0, totalSpent: 0 },
                    ownedCosmetics: profile.ownedCosmetics,
                    equipped: profile.equipped,
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

        if (action === "get-wallet") {
            const profile = await AnonymousProfile.findOne(
                { anonId, env },
                { wallet: 1, _id: 0 }
            );

            return res.json({
                ok: true,
                wallet: profile?.wallet ?? {
                    embers: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                },
            });
        }

        if (action === "earn-embers") {
            const amount = Number(req.body.amount) || 1;

            if (amount <= 0 || amount > 101) {
                return res.status(400).json({ error: "Invalid amount" });
            }

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                {
                    $inc: {
                        "wallet.embers": amount,
                        "wallet.totalEarned": amount,
                    },
                    $set: { lastSeen: new Date() },
                },
                { new: true }
            );

            return res.json({
                ok: true,
                embers: profile.wallet.embers,
                totalEarned: profile.wallet.totalEarned,
            });
        }

        if (action === "purchase") {
            const { itemId, price } = req.body || {};

            if (!itemId || typeof itemId !== "string") {
                return res.status(400).json({ error: "Missing itemId" });
            }

            const cost = Number(price);

            if (!Number.isFinite(cost) || cost <= 0) {
                return res.status(400).json({ error: "Invalid price" });
            }

            const profile = await AnonymousProfile.findOneAndUpdate(
                {
                    anonId,
                    env,
                    "wallet.embers": { $gte: cost },
                    ownedCosmetics: { $ne: itemId },
                },
                {
                    $inc: {
                        "wallet.embers": -cost,
                        "wallet.totalSpent": cost,
                    },
                    $addToSet: {
                        ownedCosmetics: itemId,
                    },
                    $set: {
                        lastSeen: new Date(),
                    },
                },
                { new: true }
            );

            if (!profile) {
                return res.status(400).json({
                    error: "Not enough embers or item already owned",
                });
            }

            return res.json({
                ok: true,
                wallet: profile.wallet,
                ownedCosmetics: profile.ownedCosmetics,
            });
        }

        if (action === "equip") {
            const { itemId } = req.body;

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env, ownedCosmetics: itemId },
                { "equipped.flameTheme": itemId },
                { new: true }
            );

            if (!profile) {
                return res.status(400).json({ error: "Item not owned" });
            }

            return res.json({
                ok: true,
                equipped: profile.equipped,
            });
        }

        return res.status(400).json({ error: "Invalid action" });
    } catch (err) {
        console.error("Error in /api/anon-profile:", err);
        return res.status(500).json({ error: err.message });
    }
}
