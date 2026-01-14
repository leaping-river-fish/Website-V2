// something seems to be adding multiple crimson themes to mongo, ??

import { useCallback } from "react";
import { useQuestToast } from "../../contexts/QuestToastContext";
import { useEmbers } from "../../contexts/EmberContext";
import { useQuestContext } from "../../contexts/QuestContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "exploration":
            return "🗺️";
        case "engagement":
            return "💬";
        case "collection":
            return "💎";
        case "mastery":
            return "🏆";
        default:
            return "⭐";
    }
};

interface CompletedQuest {
    questId: string;
    questName: string;
    category: string;
    reward: number;
}

export function useQuestTracker() {
    const { showQuestComplete } = useQuestToast();
    const { refreshEmbers } = useEmbers();
    const { triggerQuestUpdate } = useQuestContext();
    
    const processCompletedQuests = useCallback(async (completedQuests?: CompletedQuest[]) => {
        if (!completedQuests || completedQuests.length === 0) return;
    
        completedQuests.forEach((quest) => {
            const icon = getCategoryIcon(quest.category);
            showQuestComplete(quest.questName, icon, quest.reward);
        });
        
        await refreshEmbers();
        triggerQuestUpdate();
    }, [showQuestComplete, refreshEmbers, triggerQuestUpdate]);

    const trackQuest = useCallback(async (questId: string, increment: number = 1) => {
        try {
            const response = await fetch(`${API_BASE}/quests/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ questId, increment }),
            });

            const data = await response.json();

            if (data.ok && data.questCompleted) {
                const icon = getCategoryIcon(data.category);
                showQuestComplete(data.questName, icon, data.reward);
                
                await refreshEmbers();
            } 
            
            triggerQuestUpdate();
            
            return data;
        } catch (error) {
            console.error("Error tracking quest:", error);
            return { ok: false, error };
        }
    }, [showQuestComplete, refreshEmbers, triggerQuestUpdate]);

    const completeQuest = useCallback(async (questId: string) => {
        try {
            const response = await fetch(`${API_BASE}/quests/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ questId }),
            });

            const data = await response.json();

            if (data.ok && data.questCompleted) {
                // Show toast notification
                const icon = getCategoryIcon(data.category);
                showQuestComplete(data.questName, icon, data.reward);
                
                await refreshEmbers();
            } 
            
            triggerQuestUpdate();

            return data;
        } catch (error) {
            console.error("Error completing quest:", error);
            return { ok: false, error };
        }
    }, [showQuestComplete, refreshEmbers, triggerQuestUpdate]);

    return { trackQuest, completeQuest, processCompletedQuests };
}