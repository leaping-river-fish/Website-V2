import type { IncomingMessage, ServerResponse } from "http";
import * as cookie from "cookie";

import { connectMongo } from "./models/mongodb";
import AnonymousProfile, { type OwnedDragon } from "./models/AnonymousProfile";
import { completeQuest, updateQuestProgress, getQuestById, initializeQuests } from "./quests";

interface RequestBody {
    action?: "identify" | "complete-intro"| "earn-embers" | "get-wallet"| "purchase" | "equip" | "complete-tutorial" | "purchase-dragon" | "upgrade-dragon" | "collect-dragon-embers" | "get-dragons";
    anonId?: string;
    amount?: number;
    itemId?: string;
    price?: number;
    dragonId?: string;
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
        const { action, amount = 0, itemId, price, dragonId } = body;

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
                tutorialCompleted: false,
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
                        equipped: { flameTheme: "flame:crimson" },
                        ownedDragons: [{
                            dragonId: "dragon:lumie",
                            level: 1,
                            acquiredAt: new Date(),
                            totalGenerated: 0,
                            lastCollectedAt: new Date(),
                        }],
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

            // Auto-grant Lumie to existing users who don't have any dragons
            if (!profile.ownedDragons || profile.ownedDragons.length === 0) {
                profile.ownedDragons = [{
                    dragonId: "dragon:lumie",
                    level: 1,
                    acquiredAt: new Date(),
                    totalGenerated: 0,
                    lastCollectedAt: new Date(),
                }];
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
                    tutorialCompleted: profile.tutorialCompleted,
                    quests: profile.quests,
                    wallet: profile.wallet ?? { embers: 0, totalEarned: 0, totalSpent: 0 },
                    ownedCosmetics: profile.ownedCosmetics,
                    equipped: profile.equipped,
                    ownedDragons: profile.ownedDragons ?? [],
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
                { wallet: 1, tutorialCompleted: 1, _id: 0 }
            );

            return sendJSON(res, 200, {
                ok: true,
                wallet: profile?.wallet ?? {
                    embers: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                },
                tutorialCompleted: profile?.tutorialCompleted ?? false,
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

            const firstPurchaseResult = await updateQuestProgress(anonId, env, "first_purchase", 1);
            if (firstPurchaseResult.questCompleted) {
                const questDef = getQuestById("first_purchase");
                completedQuests.push({
                    questId: "first_purchase",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: firstPurchaseResult.reward,
                });
            }
            
            if (firstPurchaseResult.metaAchievements && firstPurchaseResult.metaAchievements.length > 0) {
                completedQuests.push(...firstPurchaseResult.metaAchievements);
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
                
                if (result.metaAchievements && result.metaAchievements.length > 0) {
                    completedQuests.push(...result.metaAchievements);
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

        // ---------------- COMPLETE TUTORIAL ----------------
        if (action === "complete-tutorial") {
            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                { $set: { tutorialCompleted: true, lastSeen: new Date() } },
                { new: true }
            );

            if (!profile) {
                return sendJSON(res, 404, { error: "Profile not found" });
            }

            return sendJSON(res, 200, {
                ok: true,
                tutorialCompleted: profile.tutorialCompleted,
            });
        }

        // ---------------- PURCHASE DRAGON ----------------
        if (action === "purchase-dragon") {
            if (!dragonId || typeof dragonId !== "string") {
                return sendJSON(res, 400, { error: "Missing dragonId" });
            }

            const cost = Number(price);

            if (!Number.isFinite(cost) || cost <= 0) {
                return sendJSON(res, 400, { error: "Invalid price" });
            }

            const profile = await AnonymousProfile.findOneAndUpdate(
                {
                    anonId,
                    env,
                    "wallet.embers": { $gte: cost },
                    "ownedDragons.dragonId": { $ne: dragonId },
                },
                {
                    $inc: {
                        "wallet.embers": -cost,
                        "wallet.totalSpent": cost,
                    },
                    $push: {
                        ownedDragons: {
                            dragonId,
                            level: 1,
                            acquiredAt: new Date(),
                            totalGenerated: 0,
                            lastCollectedAt: new Date(),
                        },
                    },
                    $set: {
                        lastSeen: new Date(),
                    },
                },
                { new: true }
            );

            if (!profile) {
                return sendJSON(res, 400, {
                    error: "Not enough embers or dragon already owned",
                });
            }

            const completedQuests: CompletedQuest[] = [];
            const firstPurchaseResult = await updateQuestProgress(anonId, env, "first_purchase", 1);
            if (firstPurchaseResult.questCompleted) {
                const questDef = getQuestById("first_purchase");
                completedQuests.push({
                    questId: "first_purchase",
                    questName: questDef?.name,
                    category: questDef?.category,
                    reward: firstPurchaseResult.reward,
                });
            }
            
            if (firstPurchaseResult.metaAchievements && firstPurchaseResult.metaAchievements.length > 0) {
                completedQuests.push(...firstPurchaseResult.metaAchievements);
            }

            return sendJSON(res, 200, {
                ok: true,
                wallet: profile.wallet,
                ownedDragons: profile.ownedDragons,
                completedQuests,
            });
        }

        // ---------------- UPGRADE DRAGON ----------------
        if (action === "upgrade-dragon") {
            if (!dragonId || typeof dragonId !== "string") {
                return sendJSON(res, 400, { error: "Missing dragonId" });
            }

            const profile = await AnonymousProfile.findOne({ anonId, env });

            if (!profile) {
                return sendJSON(res, 404, { error: "Profile not found" });
            }

            if (!profile.ownedDragons || profile.ownedDragons.length === 0) {
                return sendJSON(res, 400, { error: "No dragons owned" });
            }

            const dragon = profile.ownedDragons.find((d: OwnedDragon) => d.dragonId === dragonId);

            if (!dragon) {
                return sendJSON(res, 400, { error: "Dragon not owned" });
            }

            const upgradeCost = 500 * dragon.level;

            if (profile.wallet.embers < upgradeCost) {
                return sendJSON(res, 400, { error: "Not enough embers" });
            }

            dragon.level += 1;
            profile.wallet.embers -= upgradeCost;
            profile.wallet.totalSpent += upgradeCost;
            profile.lastSeen = new Date();

            await profile.save();

            return sendJSON(res, 200, {
                ok: true,
                wallet: profile.wallet,
                dragon: {
                    dragonId: dragon.dragonId,
                    level: dragon.level,
                    totalGenerated: dragon.totalGenerated,
                },
            });
        }

        // ---------------- COLLECT DRAGON EMBERS ----------------
        if (action === "collect-dragon-embers") {
            const profile = await AnonymousProfile.findOne({ anonId, env });

            if (!profile) {
                return sendJSON(res, 404, { error: "Profile not found" });
            }

            if (!profile.ownedDragons || profile.ownedDragons.length === 0) {
                return sendJSON(res, 200, {
                    ok: true,
                    collected: 0,
                    wallet: profile.wallet,
                });
            }

            // Dragon generation rates (embers per 10 seconds)
            const dragonRates: Record<string, number> = {
                "dragon:lumie": 5,
                "dragon:fire": 3,
                "dragon:water": 2,
                "dragon:ice": 8,
                "dragon:flora": 5,
                "dragon:stone": 6,
                "dragon:wind": 4,
                "dragon:steel": 9,
                "dragon:power": 7,
                "dragon:lucky": 10,
                "dragon:dawn": 11,
                "dragon:dusk": 12,
                "dragon:shad": 13,
            };

            let totalCollected = 0;
            const now = new Date();

            for (const dragon of profile.ownedDragons) {
                const baseRate = dragonRates[dragon.dragonId] || 1;
                const ratePerSecond = (baseRate * dragon.level) / 10;
                
                const lastCollected = dragon.lastCollectedAt || dragon.acquiredAt;
                const secondsElapsed = Math.floor((now.getTime() - lastCollected.getTime()) / 1000);
                
                const generated = Math.floor(ratePerSecond * secondsElapsed);
                
                if (generated > 0) {
                    totalCollected += generated;
                    dragon.totalGenerated += generated;
                    dragon.lastCollectedAt = now;
                }
            }

            if (totalCollected > 0) {
                profile.wallet.embers += totalCollected;
                profile.wallet.totalEarned += totalCollected;
            }

            profile.lastSeen = now;
            await profile.save();

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

            return sendJSON(res, 200, {
                ok: true,
                collected: totalCollected,
                wallet: profile.wallet,
                ownedDragons: profile.ownedDragons,
                completedQuests,
            });
        }

        // ---------------- GET DRAGONS ----------------
        if (action === "get-dragons") {
            const profile = await AnonymousProfile.findOne(
                { anonId, env },
                { ownedDragons: 1, _id: 0 }
            );

            return sendJSON(res, 200, {
                ok: true,
                ownedDragons: profile?.ownedDragons ?? [],
            });
        }

        return sendJSON(res, 400, { error: "Invalid action" });
    } catch (err: any) {
        console.error("❌ /api/anon-profile error:", err);
        return sendJSON(res, 500, { error: "Internal Server Error" });
    }
}