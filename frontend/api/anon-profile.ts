import type { IncomingMessage, ServerResponse } from "http";
import * as cookie from "cookie";

import { connectMongo } from "./models/mongodb";
import AnonymousProfile from "./models/AnonymousProfile";
import { completeQuest, updateQuestProgress, getQuestById, initializeQuests } from "./quests";

interface RequestBody {
    action?: "identify" | "complete-intro"| "earn-embers" | "get-wallet"| "purchase" | "equip";
    anonId?: string;
    amount?: number;
    itemId?: string;
    price?: number;
}

interface CompletedQuest {
    questId: string;
    questName?: string;
    category?: string;
    reward: number;
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

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        // Special case: allow get-wallet without anonId
        if (!anonId && action === "get-wallet") {
            return sendJSON(res, 200, {
                ok: true,
                wallet: {
                    embers: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                },
            });
        }

        if (!anonId) {
            console.warn("Missing anonId");
            return sendJSON(res, 400, { error: "Missing anonId" });
        }

        // ---------------- IDENTIFY ----------------

        if (action === "identify") {
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

            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                {
                    $setOnInsert: {
                        createdAt: new Date(),
                        ownedCosmetics: ["flame:crimson"],
                        equipped: { flameTheme: "flame:crimson" }
                    },
                    $set: { lastSeen: new Date() },
                },
                { upsert: true, new: true }
            );

            let needsSave = false;

            const uniqueCosmetics = [...new Set(profile.ownedCosmetics)];
            if (uniqueCosmetics.length !== profile.ownedCosmetics.length) {
                profile.ownedCosmetics = uniqueCosmetics;
                needsSave = true;
            }
            
            if (profile.equipped?.flameTheme === "crimson") {
                profile.equipped.flameTheme = "flame:crimson";
                needsSave = true;
            }

            if (needsSave) await profile.save();

            await initializeQuests(profile);
            
            const completedQuests: CompletedQuest[] = [];
            const firstVisitResult = await completeQuest(anonId, env, "first_visit");

            if (firstVisitResult.questCompleted) {
                const questDef = getQuestById("first_visit");
                completedQuests.push({
                    questId: "first_visit",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: firstVisitResult.reward,
                });
            }

            if (firstVisitResult.metaAchievements && firstVisitResult.metaAchievements.length > 0) {
                completedQuests.push(...firstVisitResult.metaAchievements);
            }

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
                completedQuests,
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

            const completedQuests: CompletedQuest[] = [];
            
            const result = await completeQuest(anonId, env, "complete_intro");
            if (result.questCompleted) {
                const questDef = getQuestById("complete_intro");
                completedQuests.push({
                    questId: "complete_intro",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: result.reward,
                });
            }

            if (result.metaAchievements && result.metaAchievements.length > 0) {
                completedQuests.push(...result.metaAchievements);
            }

            return sendJSON(res, 200, { 
                ok: true, 
                profile,
                completedQuests,
            });
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
            const earnAmount = Number(amount) || 1;

            if (earnAmount <= 0 || earnAmount > 101) {
                return sendJSON(res, 400, { error: "Invalid amount" });
            }

            let profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                {
                    $inc: {
                        "wallet.embers": earnAmount,
                        "wallet.totalEarned": earnAmount,
                    },
                    $set: { lastSeen: new Date() },
                },
                { new: true }
            );

            if (!profile) {
                return sendJSON(res, 404, { error: "Profile not found" });
            }

            const completedQuests: CompletedQuest[] = [];

            const emberQuests = [
                { id: "ember_hoarder", check: profile.wallet.embers >= 10000 },
                { id: "ember_tycoon", check: profile.wallet.totalEarned >= 30000 }
            ];

            for (const { id, check } of emberQuests) {
                if (check) {
                    const result = await updateQuestProgress(anonId, env, id, 0);
                    if (result.questCompleted) {
                        const questDef = getQuestById(id);
                        completedQuests.push({
                            questId: id,
                            questName: questDef?.name,
                            category: questDef?.category,
                            reward: result.reward,
                        });
                    }
                    
                    if (result.metaAchievements && result.metaAchievements.length > 0) {
                        completedQuests.push(...result.metaAchievements);
                    }
                }
            }

            if (completedQuests.length > 0) {
                profile = await AnonymousProfile.findOne({ anonId, env });
            }

            return sendJSON(res, 200, {
                ok: true,
                embers: profile.wallet.embers,
                totalEarned: profile.wallet.totalEarned,
                completedQuests,
            });
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

            const completedQuests: CompletedQuest[] = [];

            const firstPurchaseResult = await completeQuest(anonId, env, "first_purchase");
            if (firstPurchaseResult.questCompleted) {
                const questDef = getQuestById("first_purchase");
                completedQuests.push({
                    questId: "first_purchase",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: firstPurchaseResult.reward,
                });
            }

            for (const questId of ["collector", "completionist"]) {
                const result = await updateQuestProgress(anonId, env, questId, 0);
                if (result.questCompleted) {
                    const questDef = getQuestById(questId);
                    completedQuests.push({
                        questId,
                        questName: questDef?.name,
                        category: questDef?.category,
                        reward: result.reward,
                    });
                }
            }

            return sendJSON(res, 200, { 
                ok: true, 
                wallet: profile.wallet, 
                ownedCosmetics: profile.ownedCosmetics, 
                completedQuests 
            });
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

            const completedQuests: CompletedQuest[] = [];
            
            const result = await updateQuestProgress(anonId, env, "style_switcher", 1);
            if (result.questCompleted) {
                const questDef = getQuestById("style_switcher");
                completedQuests.push({
                    questId: "style_switcher",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: result.reward,
                });
            }

            if (result.metaAchievements && result.metaAchievements.length > 0) {
                completedQuests.push(...result.metaAchievements);
            }

            return sendJSON(res, 200, { 
                ok: true, 
                equipped: profile.equipped, 
                completedQuests 
            });
        }


        return sendJSON(res, 400, { error: "Invalid action" });
    } catch (err: any) {
        console.error("❌ /api/anon-profile error:", err);
        return sendJSON(res, 500, { error: "Internal Server Error" });
    }
}