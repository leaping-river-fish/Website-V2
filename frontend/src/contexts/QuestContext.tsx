import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface QuestContextValue {
    questUpdateTrigger: number;
    triggerQuestUpdate: () => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
    const [questUpdateTrigger, setQuestUpdateTrigger] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const triggerQuestUpdate = useCallback(() => {
        setQuestUpdateTrigger(prev => prev + 1);
    }, []);
    
    return (
        <QuestContext.Provider value={{ 
            questUpdateTrigger, 
            triggerQuestUpdate,
            isAuthenticated,
            setIsAuthenticated 
        }}>
            {children}
        </QuestContext.Provider>
    );
}

export function useQuestContext() {
    const ctx = useContext(QuestContext);
    if (!ctx) throw new Error("useQuestContext must be used within QuestProvider");
    return ctx;
}