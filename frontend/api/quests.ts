import type { IncomingMessage, ServerResponse } from "http";
import * as cookie from "cookie";
import { connectMongo } from "./models/mongodb";
import AnonymousProfile from "./models/AnonymousProfile";

// ============= QUEST DEFINITIONS =============

export const QUEST_CATEGORIES = {
    EXPLORATION: "exploration",
    ENGAGEMENT: "engagement",
    COLLECTION: "collection",
    MASTERY: "mastery",
} as const;

interface QuestDefinition {
    id: string;
    name: string;
    description: string;
    category: string;
    requirement: number;
    reward: number;
    hidden: boolean;
}

interface QuestResult {
    profile: any;
    questCompleted: boolean;
    reward: number;
    metaAchievements?: any[];
}

const questDefinitions: QuestDefinition[] = [
    // EXPLORATION QUESTS
    {
        id: "first_visit",
        name: "Welcome!",
        description: "Visit the website for the first time",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 10,
        hidden: false,
    },
    {
        id: "visit_home",
        name: "Home Sweet Home",
        description: "Visit the home page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "complete_intro",
        name: "Getting Started",
        description: "Beat Lumie the Dragon!",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 1000,
        hidden: false,
    },
    {
        id: "visit_about",
        name: "Getting to Know You",
        description: "View the about page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "visit_gallery",
        name: "Art Enthusiast",
        description: "Visit the gallery page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "visit_projects",
        name: "Code Explorer",
        description: "Check out the projects page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "visit_contact",
        name: "Networker",
        description: "Visit the contact page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "visit_achievements",
        name: "Achievement Hunter",
        description: "View the achievements page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "visit_shop",
        name: "Retail Therapy",
        description: "View the shop page",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 200,
        hidden: false,
    },
    {
        id: "explore_all_pages",
        name: "Site Explorer",
        description: "Visit all main pages",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 7,
        reward: 1000,
        hidden: false,
    },
    // ENGAGEMENT QUESTS
    {
        id: "send_message",
        name: "Hello World!",
        description: "Send a message via the contact form",
        category: QUEST_CATEGORIES.ENGAGEMENT,
        requirement: 1,
        reward: 1000,
        hidden: true,
    },
    {
        id: "chatbot_conversations",
        name: "Conversationalist",
        description: "Talk to Lumie 5 times",
        category: QUEST_CATEGORIES.ENGAGEMENT,
        requirement: 5,
        reward: 500,
        hidden: true,
    },
    {
        id: "daily_visitor",
        name: "Daily Visitor",
        description: "Visit the site on 3 different days",
        category: QUEST_CATEGORIES.ENGAGEMENT,
        requirement: 3,
        reward: 3000,
        hidden: true,
    },
    {
        id: "weekly_visitor",
        name: "Regular Visitor",
        description: "Visit the site on 7 different days",
        category: QUEST_CATEGORIES.ENGAGEMENT,
        requirement: 7,
        reward: 7000,
        hidden: true,
    },
    {
        id: "gallery_views",
        name: "Gallery Enthusiast",
        description: "View all the gallery images",
        category: QUEST_CATEGORIES.ENGAGEMENT,
        requirement: 35,
        reward: 500,
        hidden: true,
    },
    // COLLECTION QUESTS
    {
        id: "first_purchase",
        name: "First Purchase",
        description: "Buy your first cosmetic item",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 1,
        reward: 1000,
        hidden: false,
    },
    {
        id: "collector",
        name: "Flame Collector",
        description: "Own 3 different flame themes",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 3,
        reward: 1000,
        hidden: false,
    },
    {
        id: "completionist",
        name: "Flame Completionist",
        description: "Own all flame themes",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 6,
        reward: 2000,
        hidden: false,
    },
    {
        id: "ember_hoarder",
        name: "Ember Hoarder",
        description: "Accumulate 10000 embers",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 10000,
        reward: 1000,
        hidden: false,
    },
    {
        id: "ember_tycoon",
        name: "Ember Tycoon",
        description: "Collect 30000 embers cumulatively",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 30000,
        reward: 2000,
        hidden: false,
    },
    // MASTERY QUESTS
    {
        id: "style_switcher",
        name: "Trend Setter",
        description: "Change your equipped flame theme 3 times",
        category: QUEST_CATEGORIES.MASTERY,
        requirement: 3,
        reward: 300,
        hidden: false,
    },
    {
        id: "achievement_25",
        name: "Rising Star",
        description: "Complete 25% of all achievements",
        category: QUEST_CATEGORIES.MASTERY,
        requirement: 25,
        reward: 1000,
        hidden: false,
    },
    {
        id: "achievement_50",
        name: "Halfway There",
        description: "Complete 50% of all achievements",
        category: QUEST_CATEGORIES.MASTERY,
        requirement: 50,
        reward: 2500,
        hidden: false,
    },
    {
        id: "achievement_75",
        name: "Nearly Perfect",
        description: "Complete 75% of all achievements",
        category: QUEST_CATEGORIES.MASTERY,
        requirement: 75,
        reward: 5000,
        hidden: false,
    },
    {
        id: "achievement_100",
        name: "Perfectionist",
        description: "Complete ALL achievements!",
        category: QUEST_CATEGORIES.MASTERY,
        requirement: 100,
        reward: 10000,
        hidden: false,
    },
];

const META_QUEST_IDS = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];

export function getQuestById(questId: string): QuestDefinition | undefined {
    return questDefinitions.find(q => q.id === questId);
}

export function getAllQuests(): QuestDefinition[] {
    return questDefinitions;
}

// ============= QUEST SERVICE FUNCTIONS =============

function getCountableQuests(quests: any[], profileQuests: any[]) {
    return quests.filter(q => {
        if (META_QUEST_IDS.includes(q.id)) return false;
        const userQ = profileQuests?.find(uq => uq.questId === q.id);
        if (q.hidden && (!userQ || userQ.progress === 0)) return false;
        return true;
    });
}

function buildQuestCompletion(questId: string, questDef: QuestDefinition | undefined, reward: number) {
    return {
        questId,
        questName: questDef?.name,
        category: questDef?.category,
        reward,
    };
}

export async function initializeQuests(profile: any) {
    const allQuests = getAllQuests();
    const existingQuestIds = new Set(profile.quests.map((q: any) => q.questId));
    
    let needsSave = false;
    
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
        await profile.save();
    }
    
    return profile;
}

export async function updateQuestProgress(anonId: string, env: string, questId: string, incrementBy: number = 1) {
    const questDef = getQuestById(questId);
    
    if (!questDef) {
        throw new Error(`Quest ${questId} not found`);
    }

    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    let quest = profile.quests.find((q: any) => q.questId === questId);
    
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
        const ownedLegendaries = profile.ownedDragons?.filter((d: any) => 
            legendaryDragons.includes(d.dragonId)
        ).length || 0;
        quest.progress = ownedLegendaries;
    } else {
        quest.progress += incrementBy;
    }

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

    const isEmberSync = (questId === "ember_hoarder" || questId === "ember_tycoon") && incrementBy === 0;
    const metaAchievements = isEmberSync ? [] : await checkMetaAchievements(anonId, env);

    return { profile, questCompleted, reward, metaAchievements };
}

export async function setQuestProgress(anonId: string, env: string, questId: string, value: number): Promise<QuestResult> {
    const questDef = getQuestById(questId);
    
    if (!questDef) {
        throw new Error(`Quest ${questId} not found`);
    }

    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    let quest = profile.quests.find((q: any) => q.questId === questId);
    
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

export async function completeQuest(anonId: string, env: string, questId: string) {
    return await setQuestProgress(anonId, env, questId, 999999);
}

export async function getUserQuestsWithDefinitions(anonId: string, env: string) {
    const profile = await AnonymousProfile.findOne({ anonId, env });
    
    if (!profile) {
        throw new Error("Profile not found");
    }

    await initializeQuests(profile);

    const allQuests = getAllQuests();
    
    const questsWithDefs = allQuests.map(questDef => {
        const userQuest = profile.quests.find((q: any) => q.questId === questDef.id) || {
            questId: questDef.id,
            progress: 0,
            completed: false,
        };

        let progress = userQuest.progress;
        
        if (questDef.id === "ember_hoarder") {
            progress = profile.wallet.embers || 0;
        } else if (questDef.id === "ember_tycoon") {
            progress = profile.wallet.totalEarned || 0;
        } else if (questDef.id === "collector" || questDef.id === "completionist") {
            progress = profile.ownedCosmetics?.length || 0;
        } else if (questDef.id === "achievement_25" || questDef.id === "achievement_50" || 
                questDef.id === "achievement_75" || questDef.id === "achievement_100") {
            
            const metaQuestIds = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];
            const countableQuests = allQuests.filter(q => {
                if (metaQuestIds.includes(q.id)) return false;
                const userQ = profile.quests.find((uq: any) => uq.questId === q.id);
                if (q.hidden && (!userQ || userQ.progress === 0)) return false;
                return true;
            });
            const completedCountable = countableQuests.filter(q => {
                const quest = profile.quests.find((uq: any) => uq.questId === q.id);
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

    const metaQuestIds = ["achievement_25", "achievement_50", "achievement_75", "achievement_100"];
    const countableQuests = questsWithDefs.filter(q => {
        if (metaQuestIds.includes(q.id)) return false;
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

async function checkMetaAchievements(anonId: string, env: string) {
    const { quests } = await getUserQuestsWithDefinitions(anonId, env);
    const countableQuests = getCountableQuests(quests, []);
    const completionPercentage = Math.round((countableQuests.filter((q: any) => q.completed).length / countableQuests.length) * 100);
    
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

export async function trackPageVisit(anonId: string, env: string, pageName: string) {
    const questMap: Record<string, string> = {
        home: "visit_home",
        about: "visit_about",
        gallery: "visit_gallery",
        projects: "visit_projects",
        contact: "visit_contact",
        achievements: "visit_achievements",
        shop: "visit_shop", 
    };
    
    const completedQuests: any[] = [];
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

// ============= HELPER FUNCTIONS =============

function sendJSON(res: ServerResponse, status: number, data: any) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

async function parseBody(req: IncomingMessage): Promise<any> {
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

// ============= MAIN HANDLER =============

export default async function handler(
    req: IncomingMessage & { cookies?: Record<string, string> },
    res: ServerResponse
) {
    try {
        await connectMongo();

        const cookies = cookie.parse(req.headers.cookie || "");
        const anonId = cookies["anon_id"];
        
        if (!anonId) {
            return sendJSON(res, 401, { error: "Not authenticated" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        // GET /api/quests - Get all quests with user progress
        if (req.method === "GET") {
            const data = await getUserQuestsWithDefinitions(anonId, env);
            return sendJSON(res, 200, { ok: true, ...data });
        }

        // POST endpoints
        if (req.method === "POST") {
            const body = await parseBody(req);
            const { action, questId, increment = 1, pageName } = body;

            // POST with action: "track-page"
            if (action === "track-page") {
                if (!pageName) {
                    return sendJSON(res, 400, { error: "pageName required" });
                }

                const result = await trackPageVisit(anonId, env, pageName);
                
                return sendJSON(res, 200, { 
                    ok: true,
                    completedQuests: result.completedQuests || [],
                });
            }

            // POST with action: "complete"
            if (action === "complete") {
                if (!questId) {
                    return sendJSON(res, 400, { error: "questId required" });
                }

                const result = await completeQuest(anonId, env, questId);
                const questDef = getQuestById(questId);
                
                return sendJSON(res, 200, {
                    ok: true,
                    questCompleted: result.questCompleted,
                    reward: result.reward,
                    questName: questDef?.name,
                    category: questDef?.category
                });
            }

            // POST with action: "track"
            if (action === "track") {
                if (!questId) {
                    return sendJSON(res, 400, { error: "questId required" });
                }

                const result = await updateQuestProgress(anonId, env, questId, increment);
                const questDef = getQuestById(questId);
                
                return sendJSON(res, 200, {
                    ok: true,
                    questCompleted: result.questCompleted,
                    reward: result.reward,
                    questName: questDef?.name,
                    category: questDef?.category,
                });
            }

            return sendJSON(res, 400, { error: "Invalid action" });
        }

        return sendJSON(res, 405, { error: "Method not allowed" });
    } catch (err: any) {
        console.error("Error in /api/quests:", err);
        return sendJSON(res, 500, { error: err.message });
    }
}
