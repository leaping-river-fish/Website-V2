import express from "express";
import {
    getUserQuestsWithDefinitions,
    updateQuestProgress,
    completeQuest,
    trackPageVisit,
} from "./questService.js";
import { getQuestById } from "./questDefinitions.js";

export const router = express.Router();

/**
 * GET /api/quests
 * Get all quests with user progress
 */
router.get("/", async (req, res) => {
    try {
        const anonId = req.cookies?.anon_id;
        
        if (!anonId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
        
        const data = await getUserQuestsWithDefinitions(anonId, env);
        
        res.json({ ok: true, ...data });
    } catch (err) {
        console.error("Error fetching quests:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/quests/track
 * Track quest progress
 */
router.post("/track", async (req, res) => {
    try {
        const anonId = req.cookies?.anon_id;
        
        if (!anonId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { questId, increment = 1 } = req.body;
        
        if (!questId) {
            return res.status(400).json({ error: "questId required" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
        
        const result = await updateQuestProgress(anonId, env, questId, increment);
        
        const questDef = getQuestById(questId);
        
        res.json({
            ok: true,
            questCompleted: result.questCompleted,
            reward: result.reward,
            questName: questDef?.name,
            category: questDef?.category,
        });
    } catch (err) {
        console.error("Error tracking quest:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/quests/complete
 * Mark a quest as completed (for one-off achievements)
 */
router.post("/complete", async (req, res) => {
    try {
        const anonId = req.cookies?.anon_id;
        
        if (!anonId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { questId } = req.body;
        
        if (!questId) {
            return res.status(400).json({ error: "questId required" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
        
        const result = await completeQuest(anonId, env, questId);
        
        const questDef = getQuestById(questId);
        
        res.json({
            ok: true,
            questCompleted: result.questCompleted,
            reward: result.reward,
            questName: questDef?.name,
            category: questDef?.category
        });
    } catch (err) {
        console.error("Error completing quest:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/quests/track-page
 * Track page visits for exploration quests
 */
router.post("/track-page", async (req, res) => {
    try {
        const anonId = req.cookies?.anon_id;
        
        if (!anonId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { pageName } = req.body;
        
        if (!pageName) {
            return res.status(400).json({ error: "pageName required" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
        
        const result = await trackPageVisit(anonId, env, pageName)
        
        res.json({ 
            ok: true,
            completedQuests: result.completedQuests || [],
        });
    } catch (err) {
        console.error("Error tracking page visit:", err);
        res.status(500).json({ error: err.message });
    }
});