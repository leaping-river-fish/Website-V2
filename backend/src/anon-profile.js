import { connectMongo } from "./db/mongodb.js";
import AnonymousProfile from "./schema/AnonymousProfile.js";
import { initializeQuests, completeQuest, updateQuestProgress } from "./quests/questService.js";
import { getQuestById } from "./quests/questDefinitions.js";

async function handleQuestCompletion(anonId, env, questId, increment = 0) {
    const result = await updateQuestProgress(anonId, env, questId, increment);
    const completedQuests = [];
    
    if (result.questCompleted) {
        const questDef = getQuestById(questId);
        completedQuests.push({
            questId,
            questName: questDef?.name,
            category: questDef?.category,
            reward: result.reward,
        });
    }
    
    if (result.metaAchievements?.length > 0) {
        completedQuests.push(...result.metaAchievements);
    }
    
    return completedQuests;
}

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
    
    if (!anonId && action === "get-wallet") {
        return res.json({
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

            if (needsSave) {
                await profile.save();
            }
            
            await initializeQuests(profile);
            
            const firstVisitResult = await completeQuest(anonId, env, "first_visit");
            const completedQuests = [];
            
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

            return res.json({
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

        if (action === "complete-intro") {
            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                { introGameCompleted: true },
                { new: true }
            );
            
            const result = await completeQuest(anonId, env, "complete_intro");
            const completedQuests = [];
                        
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

            return res.json({ 
                ok: true, 
                profile,
                completedQuests,
            });
        }

        if (action === "get-wallet") {
            const profile = await AnonymousProfile.findOne(
                { anonId, env },
                { wallet: 1, tutorialCompleted: 1, _id: 0 }
            );

            return res.json({
                ok: true,
                wallet: profile?.wallet ?? {
                    embers: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                },
                tutorialCompleted: profile?.tutorialCompleted ?? false,
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
            
            const completedQuests = [];
            
            const emberQuests = [
                { id: "ember_hoarder", check: profile.wallet.embers >= 10000 },
                { id: "ember_tycoon", check: profile.wallet.totalEarned >= 30000 }
            ];

            for (const { id, check } of emberQuests) {
                if (check) {
                    completedQuests.push(...await handleQuestCompletion(anonId, env, id));
                }
            }

            return res.json({
                ok: true,
                embers: profile.wallet.embers,
                totalEarned: profile.wallet.totalEarned,
                completedQuests,
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
            
            const completedQuests = [];
            completedQuests.push(...await handleQuestCompletion(anonId, env, "first_purchase", 1));
            
            const ownedCount = profile.ownedCosmetics.length;
            const collectorQuests = [
                { id: "collector", threshold: 3 },
                { id: "completionist", threshold: 6 }
            ];

            for (const { id, threshold } of collectorQuests) {
                if (ownedCount >= threshold) {
                    completedQuests.push(...await handleQuestCompletion(anonId, env, id, 0));
                }
            }
            
            return res.json({
                ok: true,
                wallet: profile.wallet,
                ownedCosmetics: profile.ownedCosmetics,
                completedQuests,
            });
        }

        if (action === "equip") {
            const { itemId } = req.body;

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

            if (!profile) {
                return res.status(400).json({ error: "Item not owned" });
            }
            
            const completedQuests = [];
            
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
            
            return res.json({
                ok: true,
                equipped: profile.equipped,
                completedQuests,
            });
        }

        if (action === "complete-tutorial") {
            const profile = await AnonymousProfile.findOneAndUpdate(
                { anonId, env },
                { $set: { tutorialCompleted: true, lastSeen: new Date() } },
                { new: true }
            );

            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            return res.json({
                ok: true,
                tutorialCompleted: profile.tutorialCompleted,
            });
        }

        if (action === "purchase-dragon") {
            const { dragonId, price } = req.body || {};

            if (!dragonId || typeof dragonId !== "string") {
                return res.status(400).json({ error: "Missing dragonId" });
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
                return res.status(400).json({
                    error: "Not enough embers or dragon already owned",
                });
            }

            const completedQuests = [];
            completedQuests.push(...await handleQuestCompletion(anonId, env, "first_purchase", 1));

            return res.json({
                ok: true,
                wallet: profile.wallet,
                ownedDragons: profile.ownedDragons,
                completedQuests,
            });
        }

        if (action === "upgrade-dragon") {
            const { dragonId } = req.body || {};

            if (!dragonId || typeof dragonId !== "string") {
                return res.status(400).json({ error: "Missing dragonId" });
            }

            const profile = await AnonymousProfile.findOne({ anonId, env });

            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            const dragon = profile.ownedDragons.find(d => d.dragonId === dragonId);

            if (!dragon) {
                return res.status(400).json({ error: "Dragon not owned" });
            }

            const upgradeCost = 500 * dragon.level;

            if (profile.wallet.embers < upgradeCost) {
                return res.status(400).json({ error: "Not enough embers" });
            }

            dragon.level += 1;
            profile.wallet.embers -= upgradeCost;
            profile.wallet.totalSpent += upgradeCost;
            profile.lastSeen = new Date();

            await profile.save();

            return res.json({
                ok: true,
                wallet: profile.wallet,
                dragon: {
                    dragonId: dragon.dragonId,
                    level: dragon.level,
                    totalGenerated: dragon.totalGenerated,
                },
            });
        }

        if (action === "collect-dragon-embers") {
            const profile = await AnonymousProfile.findOne({ anonId, env });

            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            if (!profile.ownedDragons || profile.ownedDragons.length === 0) {
                return res.json({
                    ok: true,
                    collected: 0,
                    wallet: profile.wallet,
                });
            }

            // Dragon generation rates (embers per 10 seconds)
            const dragonRates = {
                "dragon:lumie": 1,
                "dragon:fire": 2,
                "dragon:water": 2,
                "dragon:ice": 3,
                "dragon:flora": 3,
                "dragon:stone": 4,
                "dragon:wind": 4,
                "dragon:steel": 5,
                "dragon:power": 6,
                "dragon:lucky": 7,
                "dragon:dawn": 8,
                "dragon:dusk": 9,
                "dragon:shad": 10,
            };

            let totalCollected = 0;
            const now = new Date();

            for (const dragon of profile.ownedDragons) {
                const baseRate = dragonRates[dragon.dragonId] || 1;
                const ratePerSecond = (baseRate * dragon.level) / 10;
                
                const lastCollected = dragon.lastCollectedAt || dragon.acquiredAt;
                const secondsElapsed = Math.floor((now - lastCollected) / 1000);
                
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

            const completedQuests = [];
            
            const emberQuests = [
                { id: "ember_hoarder", check: profile.wallet.embers >= 10000 },
                { id: "ember_tycoon", check: profile.wallet.totalEarned >= 30000 }
            ];

            for (const { id, check } of emberQuests) {
                if (check) {
                    completedQuests.push(...await handleQuestCompletion(anonId, env, id));
                }
            }

            return res.json({
                ok: true,
                collected: totalCollected,
                wallet: profile.wallet,
                ownedDragons: profile.ownedDragons,
                completedQuests,
            });
        }

        if (action === "get-dragons") {
            const profile = await AnonymousProfile.findOne(
                { anonId, env },
                { ownedDragons: 1, _id: 0 }
            );

            return res.json({
                ok: true,
                ownedDragons: profile?.ownedDragons ?? [],
            });
        }

        return res.status(400).json({ error: "Invalid action" });
    } catch (err) {
        console.error("Error in /api/anon-profile:", err);
        return res.status(500).json({ error: err.message });
    }
}
