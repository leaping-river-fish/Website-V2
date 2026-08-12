import AnonymousProfile from "../schema/AnonymousProfile.js";
import { getQuestById, getAllQuests } from "./questDefinitions.js";

const META_QUEST_IDS = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];

function getCountableQuests(quests, profileQuests) {
    return quests.filter(q => {
        if (META_QUEST_IDS.includes(q.id)) return false;
        // Exclude Hidden category quests from counting
        if (q.category === "hidden") return false;
        const userQ = profileQuests?.find(uq => uq.questId === q.id);
        if (q.hidden && (!userQ || userQ.progress === 0)) return false;
        return true;
    });
}

function buildQuestCompletion(questId, questDef, reward) {
    return {
        questId,
        questName: questDef?.name,
        category: questDef?.category,
        reward,
    };
}

export async function initializeQuests(profile) {
    const allQuests = getAllQuests();
    const existingQuestIds = new Set(profile.quests.map(q => q.questId));
    
    let needsSave = false;
    
    // Add any new quests that don't exist yet
    for (const questDef of allQuests) {
        if (!existingQuestIds.has(questDef.id)) {
            profile.quests.push({
                questId: questDef.id,
                progress: 0,
                completed: false,
            });
            needsSave = true;
        }
    }
    
    if (needsSave) {
        await profile.save()
    }
    
    return profile;
}

export async function updateQuestProgress(anonId, env, questId, incrementBy = 1) {
    const questDef = getQuestById(questId);
    
    if (!questDef) {
        throw new Error(`Quest ${questId} not found`);
    }

    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    // Find the quest in the profile
    let quest = profile.quests.find(q => q.questId === questId);
    
    // If quest doesn't exist, initialize it
    if (!quest) {
        quest = {
            questId,
            progress: 0,
            completed: false,
        };
        profile.quests.push(quest);
    }

    // Don't update if already completed
    if (quest.completed) {
        return { profile, questCompleted: false, reward: 0 };
    }

    // Update progress
    if (questId === "ember_hoarder") {
        quest.progress = profile.wallet.embers || 0;
    } else if (questId === "ember_startup" || questId === "ember_tycoon" || questId === "unemployed") {
        quest.progress = profile.wallet.totalEarned || 0;
    } else if (questId === "collector" || questId === "completionist") {
        quest.progress = profile.ownedCosmetics?.length || 0;
    } else if (questId === "first_dragon" || questId === "second_dragon" || 
               questId === "five_dragons" || questId === "ten_dragons" || 
               questId === "all_dragons") {
        quest.progress = profile.ownedDragons?.length || 0;
    } else if (questId === "all_legendary_dragons") {
        const legendaryDragons = ["dragon:lucky", "dragon:dawn", "dragon:dusk", "dragon:shad", "dragon:lumie"];
        const ownedLegendaries = profile.ownedDragons?.filter(d => 
            legendaryDragons.includes(d.dragonId)
        ).length || 0;
        quest.progress = ownedLegendaries;
    } else if (questId === "daily_visitor" || questId === "weekly_visitor") {
        // Sync with uniqueDaysVisited count
        quest.progress = profile.uniqueDaysVisited || 0;
    } else {
        quest.progress += incrementBy;
    }

    let questCompleted = false;
    let reward = 0;

    // Check if quest is now completed
    if (quest.progress >= questDef.requirement && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date();
        questCompleted = true;
        reward = questDef.reward;

        // Award embers
        profile.wallet.embers += reward;
        profile.wallet.totalEarned += reward;
    }

    await profile.save();

    // Check for meta achievements (achievement milestones)
    const isEmberSync = (questId === "ember_hoarder" || questId === "ember_tycoon") && incrementBy === 0;
    const metaAchievements = isEmberSync ? [] : await checkMetaAchievements(anonId, env);

    return { profile, questCompleted, reward, metaAchievements };
}

/**
 * Set quest progress to a specific value
 */
export async function setQuestProgress(anonId, env, questId, value) {
    const questDef = getQuestById(questId);
    
    if (!questDef) {
        throw new Error(`Quest ${questId} not found`);
    }

    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    let quest = profile.quests.find(q => q.questId === questId);
    
    if (!quest) {
        quest = {
            questId,
            progress: 0,
            completed: false,
        };
        profile.quests.push(quest);
    }

    if (quest.completed) {
        return { profile, questCompleted: false, reward: 0 };
    }

    quest.progress = value;

    let questCompleted = false;
    let reward = 0;

    if (quest.progress >= questDef.requirement && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date();
        questCompleted = true;
        reward = questDef.reward;

        profile.wallet.embers += reward;
        profile.wallet.totalEarned += reward;
    }

    await profile.save();

    const metaQuestIds = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];
    const metaAchievements = metaQuestIds.includes(questId) ? [] : await checkMetaAchievements(anonId, env);

    return { profile, questCompleted, reward, metaAchievements };
}

/**
 * Mark a quest as completed (for one-time events)
 */
export async function completeQuest(anonId, env, questId) {
    return await setQuestProgress(anonId, env, questId, 999999);
}

/**
 * Get user's quest progress with definitions
 */
export async function getUserQuestsWithDefinitions(anonId, env) {
    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    // Initialize quests if needed
    await initializeQuests(profile);

    const allQuests = getAllQuests();
    
    const questsWithDefs = allQuests.map(questDef => {
        const userQuest = profile.quests.find(q => q.questId === questDef.id) || {
            questId: questDef.id,
            progress: 0,
            completed: false,
        };

        let progress = userQuest.progress;
        
        // Sync ember quests with wallet values
        if (questDef.id === "ember_hoarder") {
            progress = profile.wallet.embers || 0;
        } else if (questDef.id === "ember_startup" || questDef.id === "ember_tycoon" || questDef.id === "unemployed") {
            progress = profile.wallet.totalEarned || 0;
        }

        else if (questDef.id === "first_dragon" || questDef.id === "second_dragon" || 
                    questDef.id === "five_dragons" || questDef.id === "ten_dragons" || 
                    questDef.id === "all_dragons") {
            progress = profile.ownedDragons?.length || 0;
        }

        else if (questDef.id === "all_legendary_dragons") {
            const legendaryDragons = ["dragon:lucky", "dragon:dawn", "dragon:dusk", "dragon:shad", "dragon:lumie"];
            const ownedLegendaries = profile.ownedDragons?.filter(d => 
                legendaryDragons.includes(d.dragonId)
            ).length || 0;
            progress = ownedLegendaries;
        }

        // Sync collector quests with owned cosmetics count
        else if (questDef.id === "collector" || questDef.id === "completionist") {
            progress = profile.ownedCosmetics?.length || 0;
        }

        // Sync daily visit quests with uniqueDaysVisited count
        else if (questDef.id === "daily_visitor" || questDef.id === "weekly_visitor") {
            progress = profile.uniqueDaysVisited || 0;
        }

        // Sync meta achievement quests with completion percentage
        else if (questDef.id === "achievement_25" || questDef.id === "achievement_50" || 
                questDef.id === "achievement_75" || questDef.id === "achievement_100") {
            
            const metaQuestIds = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];
            const countableQuests = allQuests.filter(q => {
                if (metaQuestIds.includes(q.id)) return false;
                // Exclude Hidden category quests from counting
                if (q.category === "hidden") return false;
                const userQ = profile.quests.find(uq => uq.questId === q.id);
                if (q.hidden && (!userQ || userQ.progress === 0)) return false;
                return true;
            });
            const completedCountable = countableQuests.filter(q => {
                const quest = profile.quests.find(uq => uq.questId === q.id);
                return quest?.completed;
            }).length;
            const totalCountable = countableQuests.length;
            const completionPercentage = Math.round((completedCountable / totalCountable) * 100);
            progress = completionPercentage;
        }

        return {
            ...questDef,
            progress,
            completed: userQuest.completed,
            completedAt: userQuest.completedAt,
        };
    });

    // Calculate stats
    const metaQuestIds = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];
    const countableQuests = questsWithDefs.filter(q => {
        if (metaQuestIds.includes(q.id)) return false;
        // Exclude Hidden category quests from counting
        if (q.category === "hidden") return false;

        if (q.hidden && q.progress === 0) return false;
        return true;
    });
    const totalQuests = countableQuests.length;
    const completedQuests = countableQuests.filter(q => q.completed).length;
    const completionPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

    return {
        quests: questsWithDefs,
        stats: {
            total: totalQuests,
            completed: completedQuests,
            completionPercentage: Math.round(completionPercentage * 10) / 10,
        },
    };
}

/**
 * Check and update meta achievements (achievement milestones)
 */
async function checkMetaAchievements(anonId, env) {
    const { quests } = await getUserQuestsWithDefinitions(anonId, env);
    const countableQuests = getCountableQuests(quests);
    const completionPercentage = Math.round((countableQuests.filter(q => q.completed).length / countableQuests.length) * 100);
    
    const thresholds = [
        { id: "achievement_25", threshold: 25 },
        { id: "achievement_50", threshold: 50 },
        { id: "achievement_75", threshold: 75 },
        { id: "achievement_100", threshold: 100 },
    ];
    
    const completedMetaQuests = [];
    
    for (const { id, threshold } of thresholds) {
        if (completionPercentage >= threshold) {
            const result = await setQuestProgress(anonId, env, id, completionPercentage);
            if (result.questCompleted) {
                completedMetaQuests.push(buildQuestCompletion(id, getQuestById(id), result.reward));
            }
        }
    }
    
    return completedMetaQuests;
}

/**
 * Track page visits for exploration quests
 */
export async function trackPageVisit(anonId, env, pageName) {
    const questMap = {
        home: "visit_home",
        about: "visit_about",
        gallery: "visit_gallery",
        projects: "visit_projects",
        achievements: "visit_achievements",
        shop: "visit_shop", 
    };
    
    const completedQuests = [];
    let uniquePageVisited = false;

    const questId = questMap[pageName];
    
    if (questId) {
        const result = await updateQuestProgress(anonId, env, questId, 1);
        
        if (result.questCompleted) {
            uniquePageVisited = true;
            
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

    if (uniquePageVisited) {
        const exploreResult = await updateQuestProgress(anonId, env, "explore_all_pages", 1);
        if (exploreResult.questCompleted) {
            const questDef = getQuestById("explore_all_pages");
            completedQuests.push({
                questId: "explore_all_pages",
                questName: questDef?.name,
                category: questDef?.category,
                reward: exploreResult.reward,
            });
        }
            
        if (exploreResult.metaAchievements && exploreResult.metaAchievements.length > 0) {
            completedQuests.push(...exploreResult.metaAchievements);
        }
    }

    return { completedQuests };
}



