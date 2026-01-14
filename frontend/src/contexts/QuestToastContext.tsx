import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface QuestToast {
    id: string;
    questName: string;
    categoryIcon: string;
    reward: number;
}

interface QuestToastContextValue {
    showQuestComplete: (questName: string, categoryIcon: string, reward: number) => void;
}

const QuestToastContext = createContext<QuestToastContextValue | null>(null);

export function QuestToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<QuestToast[]>([]);
    
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);
    
    const showQuestComplete = useCallback((questName: string, categoryIcon: string, reward: number) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, questName, categoryIcon, reward }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <QuestToastContext.Provider value={{ showQuestComplete }}>
            {children}
                
            {/* Toast Container */}
            <div className="fixed top-20 right-6 z-9999 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto bg-linear-to-r from-green-900/95 to-emerald-800/95 backdrop-blur-sm border border-green-500/50 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] p-4 min-w-[300px] max-w-[400px] animate-slideIn"
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-4xl shrink-0">{toast.categoryIcon}</div>
                            <div className="grow min-w-0">
                                <p className="text-xs text-green-300 font-semibold mb-1">🎉 Quest Complete!</p>
                                <h3 className="text-white font-bold text-sm mb-1 truncate">{toast.questName}</h3>
                                <p className="text-yellow-300 text-xs font-semibold">+{toast.reward} embers earned</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeToast(toast.id);
                                }}
                                className="text-green-300 hover:text-white transition-colors shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mt-3 h-1 bg-green-950/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-linear-to-r from-green-400 to-emerald-300"
                                style={{ animation: 'progressBar 4s linear forwards' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
    
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes progressBar {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
        </QuestToastContext.Provider>
    );
}

export function useQuestToast() {
    const ctx = useContext(QuestToastContext);
    if (!ctx) throw new Error("useQuestToast must be used within QuestToastProvider");
    return ctx;
}