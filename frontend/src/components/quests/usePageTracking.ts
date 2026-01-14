import { useEffect, useRef } from "react";
import { useQuestTracker } from "./useQuestTracker";
import { useQuestContext } from "../../contexts/QuestContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function usePageTracking(pageName: string) {
    const { processCompletedQuests } = useQuestTracker();
    const { triggerQuestUpdate, isAuthenticated } = useQuestContext();
    const hasTracked = useRef(false);
    
    useEffect(() => {
        if (!isAuthenticated) return;
        
        if (hasTracked.current) return;
        hasTracked.current = true;
        
        const trackVisit = async () => {
            try {
                const response = await fetch(`${API_BASE}/quests`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action: "track-page", pageName }),
                });
                
                if (!response.ok) return;
                
                const data = await response.json();
                
                if (data.completedQuests && data.completedQuests.length > 0) {
                    await processCompletedQuests(data.completedQuests);
                } else {
                    triggerQuestUpdate(); 
                }
            } catch (error) {
                console.error(`Error tracking ${pageName} page visit:`, error);
            }
        };
        
        setTimeout(trackVisit, 100);
    }, [pageName, processCompletedQuests, triggerQuestUpdate, isAuthenticated]);
}
