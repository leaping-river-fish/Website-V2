
export const QUEST_CATEGORIES = {
    EXPLORATION: "exploration",
    ENGAGEMENT: "engagement",
    COLLECTION: "collection",
    MASTERY: "mastery",
};

export const questDefinitions = [
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
        description: "Complete the intro game",
        category: QUEST_CATEGORIES.EXPLORATION,
        requirement: 1,
        reward: 1000,
        hidden: true,
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
        name: "Collector",
        description: "Own 3 different cosmetic items",
        category: QUEST_CATEGORIES.COLLECTION,
        requirement: 3,
        reward: 1000,
        hidden: false,
    },
    {
        id: "completionist",
        name: "Completionist",
        description: "Own all cosmetic items",
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

/**
 * Get quest definition by ID
 */
export function getQuestById(questId) {
    return questDefinitions.find(q => q.id === questId);
}

/**
 * Get all quest definitions
 */
export function getAllQuests() {
    return questDefinitions;
}

/**
 * Get quests by category
 */
export function getQuestsByCategory(category) {
    return questDefinitions.filter(q => q.category === category);
}

/**
 * Calculate total possible embers from all quests
 */
export function getTotalPossibleEmbers() {
    return questDefinitions.reduce((sum, quest) => sum + quest.reward, 0);
}
