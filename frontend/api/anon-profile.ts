import type { IncomingMessage, ServerResponse } from "http";
import * as cookie from "cookie";

import { connectMongo } from "./models/mongodb";
import AnonymousProfile from "./models/AnonymousProfile";

interface RequestBody {
    action?: "identify" | "complete-intro"| "earn-embers" | "get-wallet"| "purchase" | "equip";
    anonId?: string;
    amount?: number;
    itemId?: string;
    price?: number;
}

function sendJSON(res: ServerResponse, status: number, data: any) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

async function parseBody(req: IncomingMessage): Promise<RequestBody> {
    return new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", chunk => (raw += chunk));
        req.on("end", () => {
            if (!raw) return resolve({});

            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                    reject(err);
            }
        });
        req.on("error", reject);
    });
}

export default async function handler(
    req: IncomingMessage & { cookies?: Record<string, string> },
    res: ServerResponse
) {
    if (req.method !== "POST") {
        return sendJSON(res, 405, { error: "Method Not Allowed" });
    }

    try {
        await connectMongo();

        const body = await parseBody(req);
        const { action, amount = 0, itemId, price } = body;

        const cookies = cookie.parse(req.headers.cookie || "");
        const anonId = body.anonId || cookies["anon_id"];

        if (!anonId) {
            return sendJSON(res, 400, { error: "Missing anonId" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";


        // ---------------- IDENTIFY ----------------

        if (action === "identify") {
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
            if (needsSave) await profile.save();

            res.setHeader(
                "Set-Cookie",
                cookie.serialize("anon_id", anonId, {
                    httpOnly: false,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 60 * 24 * 365,
                    path: "/",
                })
            );

            return sendJSON(res, 200, {
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

        // ---------------- COMPLETE INTRO ----------------

        if (action === "complete-intro") {
            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                {
                    $set: {
                        introGameCompleted: true,
                        lastSeen: new Date(),
                    },
                },
                { new: true }
            );

            return sendJSON(res, 200, { ok: true, profile });
        }

        // ---------------- GET WALLET ----------------
        
        if (action === "get-wallet") {
            const profile = await AnonymousProfile.findOne(
                { anonId, env },
                { wallet: 1, _id: 0 }
            );

            return sendJSON(res, 200, {
                ok: true,
                wallet: profile?.wallet ?? {
                    embers: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                },
            });
        }

        // ---------------- EARN EMBERS ----------------

        if (action === "earn-embers") {
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

            if (!profile) {
                return sendJSON(res, 404, { error: "Profile not found" });
            }

            return sendJSON(res, 200, { ok: true, profile });
        }

        // ---------------- PURCHASE ----------------
        if (action === "purchase") {
            if (!itemId || typeof itemId !== "string") return sendJSON(res, 400, { error: "Missing itemId" });

            const cost = Number(price);
            
            if (!Number.isFinite(cost) || cost <= 0) return sendJSON(res, 400, { error: "Invalid price" });

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env, "wallet.embers": { $gte: cost }, ownedCosmetics: { $ne: itemId } },
                { $inc: { "wallet.embers": -cost, "wallet.totalSpent": cost }, $addToSet: { ownedCosmetics: itemId }, $set: { lastSeen: new Date() } },
                { new: true }
            );

            if (!profile) return sendJSON(res, 400, { error: "Not enough embers or item already owned" });

            return sendJSON(res, 200, { ok: true, wallet: profile.wallet, ownedCosmetics: profile.ownedCosmetics });
        }

        // ---------------- EQUIP ----------------
        if (action === "equip") {
            if (!itemId) return sendJSON(res, 400, { error: "Missing itemId" });

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env, ownedCosmetics: itemId },
                {
                    $set: {
                        "equipped.flameTheme": itemId,
                        lastSeen: new Date(),
                    },
                },
                { new: true }
            );

            if (!profile) return sendJSON(res, 400, { error: "Item not owned" });

            return sendJSON(res, 200, { ok: true, equipped: profile.equipped });
        }


        return sendJSON(res, 400, { error: "Invalid action" });
    } catch (err: any) {
        console.error("❌ /api/anon-profile error:", err);
        return sendJSON(res, 500, { error: "Internal Server Error" });
    }
}