// Add Trigger: Hello World!, Conversationalist, Gallery views
// Achievements to add:
// complete tutorials, upgrade dragons 
// achievements, visit projects on github, collect from dragons, skip tutorial!

// Test daily visit quests

import { Trophy, Lock, CheckCircle2, Award, TrendingUp } from "lucide-react";
import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";
import { usePageTracking } from "../components/quests/usePageTracking";
import EmberIcon from "../components/navbar/EmberIcon";
import { useQuestContext } from "../contexts/QuestContext";
import { useEffect, useState } from "react";
import { useQuestToast } from "../contexts/QuestToastContext";

import { useDialogue } from '../contexts/DialogueContext';
import { DialogueBox } from '../components/DialogueBox';
import { achievementDialogue } from '../dialogue/achievement-dialogue';

interface Quest {
    id: string;
    name: string;
    description: string;
    category: string;
    requirement: number;
    reward: number;
    hidden: boolean;
    progress: number;
    completed: boolean;
    completedAt?: string;
}

interface QuestStats {
    total: number;
    completed: number;
    completionPercentage: number;
}

export default function Achievements() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [stats, setStats] = useState<QuestStats>({ total: 0, completed: 0, completionPercentage: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const { questUpdateTrigger } = useQuestContext();
    const { showQuestComplete } = useQuestToast();

    // load tutorial
    const { registerTutorial, unregisterTutorial } = useDialogue();

    useEffect(() => {
        registerTutorial(achievementDialogue.nodes);
        return () => unregisterTutorial();
    }, []);

    usePageTracking("achievements");

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "exploration": return "🗺️";
            case "engagement": return "💬";
            case "collection": return "💎";
            case "mastery": return "🏆";
            default: return "⭐";
        }
    };
    
    const fetchQuests = async () => {
        try {
            const response = await fetch(`${API_BASE}/quests`, {
                credentials: "include",
            });
            const data = await response.json();
            
            if (data.ok) {
                setQuests(data.quests);
                setStats(data.stats);
                
                // Show toast for any completed quests
                if (data.completedQuests && data.completedQuests.length > 0) {
                    data.completedQuests.forEach((quest: any) => {
                        showQuestComplete(
                            quest.questName,
                            getCategoryIcon(quest.category),
                            quest.reward
                        );
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching quests:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchQuests();
    }, []);
    
    useEffect(() => {
        if (questUpdateTrigger > 0) {
            fetchQuests();
        }
    }, [questUpdateTrigger]);
    
    const getProgressPercentage = (quest: Quest) => {
        return Math.min((quest.progress / quest.requirement) * 100, 100);
    };
    
    const getRemainingEmbers = () => {
        return quests
            .filter(q => !q.completed && !(q.hidden && q.progress === 0))
            .reduce((sum, q) => sum + q.reward, 0);
    };
    
    const categories = [
        { id: "all", name: "All" },
        { id: "exploration", name: "Exploration" },
        { id: "engagement", name: "Engagement" },
        { id: "collection", name: "Collection" },
        { id: "mastery", name: "Mastery" },
    ];
        
    const filteredQuests = filter === "all" 
        ? quests 
        : quests.filter(q => q.category === filter);
        
    if (loading) {
        return (
            <div className="bg-[#1A1410] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Trophy size={64} className="text-yellow-400 mb-4 mx-auto animate-pulse" />
                    <p className="text-lg text-gray-300">Loading achievements...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-[#1A1410] min-h-screen text-white pb-20">
            <NavbarSpacer />
            {/* Header */}
            <div className="px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Trophy size={48} className="text-yellow-400" />
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Achievements</h1>
                            <p className="text-gray-400">Track your progress and earn ember rewards</p>
                        </div>
                    </div>
    
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8" data-tutorial-id="statistics-section">
                        <div className="bg-[#2A1F1A] rounded-lg p-6 border transition-colors" style={{ borderColor: 'var(--achievement-border)' }}>
                            <div className="flex items-center gap-3">
                                <Award size={32} style={{ color: 'var(--achievement-primary)' }} />
                                <div>
                                    <p className="text-gray-400 text-sm">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed} / {stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#2A1F1A] rounded-lg p-6 border border-green-900/20">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-green-400" size={32} />
                                <div>
                                    <p className="text-gray-400 text-sm">Progress</p>
                                    <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#2A1F1A] rounded-lg p-6 border transition-colors" style={{ borderColor: 'var(--achievement-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8">
                                    <EmberIcon size={32} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Remaining</p>
                                    <p className="text-2xl font-bold">
                                        {getRemainingEmbers()} embers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-full transition-all duration-500"
                                style={{ 
                                    width: `${stats.completionPercentage}%`,
                                    background: `linear-gradient(to right, var(--achievement-primary), var(--achievement-secondary))`
                                }}
                            />
                    </div>
                    </div>
                </div>
            </div>
    
            {/* Category Filter */}
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex gap-2 overflow-x-auto pb-2" data-tutorial-id="filter-buttons">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: filter === cat.id ? 'var(--achievement-primary)' : '#2A1F1A',
                                color: filter === cat.id ? 'white' : '#9ca3af',
                            }}
                            onMouseEnter={(e) => {
                                if (filter !== cat.id) {
                                    e.currentTarget.style.backgroundColor = '#3A2F2A';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filter !== cat.id) {
                                    e.currentTarget.style.backgroundColor = '#2A1F1A';
                                }
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
    
            {/* Achievements Grid */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tutorial-id="quest-list">
                {filteredQuests.map((quest) => {
                    const isBlurred = quest.hidden && quest.progress === 0;
                    
                    return (
                        <div
                            key={quest.id}
                            className="bg-[#2A1F1A] rounded-lg p-6 border transition-all relative"
                            style={{
                                borderColor: quest.completed ? 'rgba(34, 197, 94, 0.5)' : 'var(--achievement-border)',
                                background: quest.completed 
                                    ? 'linear-gradient(to bottom right, #2A1F1A, rgba(22, 101, 52, 0.2))' 
                                    : '#2A1F1A'
                            }}
                            onMouseEnter={(e) => {
                                if (!quest.completed) {
                                    e.currentTarget.style.borderColor = 'var(--achievement-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!quest.completed) {
                                    e.currentTarget.style.borderColor = 'var(--achievement-border)';
                                }
                            }}
                        >   
                            {isBlurred && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <span className="text-yellow-400 text-sm font-bold">Coming Soon</span>
                                    </div>
                                </div>
                            )}

                            <div className={`flex gap-4 ${isBlurred ? 'blur-sm select-none' : ''}`}>
                                {/* Icon */}
                                <div className={`text-4xl shrink-0 ${quest.completed ? "" : "grayscale opacity-50"}`}>
                                    {quest.completed ? (
                                        <CheckCircle2 className="text-green-400" size={48} />
                                    ) : isBlurred ? (
                                        <Lock className="text-gray-500" size={48} />
                                    ) : (
                                        <span>{getCategoryIcon(quest.category)}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="grow min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className={`font-bold text-lg ${quest.completed ? "text-green-400" : "text-white"}`}>
                                            {isBlurred ? "???" : quest.name}
                                        </h3>
                                        <div className="flex items-center gap-1 font-bold shrink-0" style={{ color: 'var(--achievement-primary)' }}>
                                            <EmberIcon size={20} />
                                            <span>{isBlurred ? "?" : quest.reward}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-3">
                                        {isBlurred ? "???" : quest.description}
                                    </p>

                                    {/* Progress Bar */}
                                    {!quest.completed && !isBlurred && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Progress</span>
                                                <span>{quest.progress} / {quest.requirement}</span>
                                            </div>
                                            <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-300"
                                                    style={{ 
                                                        width: `${getProgressPercentage(quest)}%`,
                                                        background: `linear-gradient(to right, var(--achievement-primary), var(--achievement-secondary))`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {quest.completed && quest.completedAt && (
                                        <p className="text-xs text-green-400/70 mt-2">
                                            Completed on {new Date(quest.completedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
    
                {filteredQuests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No achievements in this category yet.
                    </div>
                )}
            </div>
            <DialogueBox nodes={achievementDialogue.nodes} />
        </div>
    );
}