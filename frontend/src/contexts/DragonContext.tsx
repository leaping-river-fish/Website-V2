import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { OwnedDragon, DragonWithDetails } from "../types/dragon";
import { getDragonById } from "../components/shop/dragonItems";
import { useEmbers } from "./EmberContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type DragonContextType = {
    ownedDragons: OwnedDragon[];
    dragonsWithDetails: DragonWithDetails[];
    pendingEmbers: number;
    isCollecting: boolean;
    refreshDragons: () => Promise<void>;
    collectAllEmbers: () => Promise<void>;
    purchaseDragon: (dragonId: string, price: number) => Promise<boolean>;
    upgradeDragon: (dragonId: string) => Promise<boolean>;
};

const DragonContext = createContext<DragonContextType | null>(null);

export function DragonProvider({ children }: { children: React.ReactNode }) {
    const [ownedDragons, setOwnedDragons] = useState<OwnedDragon[]>([]);
    const [pendingEmbers, setPendingEmbers] = useState(0);
    const [isCollecting, setIsCollecting] = useState(false);
    const { setEmbers } = useEmbers();

    // Calculate pending embers based on time elapsed
    const calculatePendingEmbers = useCallback((dragons: OwnedDragon[]): number => {
        const MAX_DRAGON_PENDING = 10000;

        const dragonRates: Record<string, number> = {
            "dragon:lumie": 5,
            "dragon:fire": 1,
            "dragon:water": 1,
            "dragon:ice": 3,
            "dragon:flora": 2,
            "dragon:stone": 2,
            "dragon:wind": 1,
            "dragon:steel": 3,
            "dragon:power": 2,
            "dragon:lucky": 5,
            "dragon:dawn": 5,
            "dragon:dusk": 5,
            "dragon:shad": 5,
        };

        let total = 0;
        const now = Date.now();

        for (const dragon of dragons) {
            const baseRate = dragonRates[dragon.dragonId] || 1;
            const ratePerSecond = (baseRate * dragon.level) / 10;
            
            const lastCollected = dragon.lastCollectedAt 
                ? new Date(dragon.lastCollectedAt).getTime()
                : new Date(dragon.acquiredAt).getTime();
            
            const secondsElapsed = Math.floor((now - lastCollected) / 1000);
            const generated = Math.floor(ratePerSecond * secondsElapsed);
            
            total += generated;
        }

        return Math.min(total, MAX_DRAGON_PENDING);
    }, []);

    // Get dragons with their details
    const dragonsWithDetails: DragonWithDetails[] = ownedDragons
        .map(dragon => {
            const details = getDragonById(dragon.dragonId);
            if (!details) return null;
            return {
                ...dragon,
                details,
            };
        })
        .filter((d): d is DragonWithDetails => d !== null);

    // Refresh dragons from backend
    const refreshDragons = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "get-dragons" }),
            });
            const data = await response.json();
            if (data.ok && data.ownedDragons) {
                setOwnedDragons(data.ownedDragons);
            }
        } catch (error) {
            console.error("Error refreshing dragons:", error);
        }
    }, []);

    // Update pending embers every second
    useEffect(() => {
        if (ownedDragons.length === 0) {
            setPendingEmbers(0);
            return;
        }

        const interval = setInterval(() => {
            const pending = calculatePendingEmbers(ownedDragons);
            setPendingEmbers(pending);
        }, 1000);

        return () => clearInterval(interval);
    }, [ownedDragons, calculatePendingEmbers]);

    // Listen for dragons loaded from profile
    useEffect(() => {
        const handleDragonsLoaded = (event: CustomEvent) => {
            if (event.detail?.ownedDragons) {
                setOwnedDragons(event.detail.ownedDragons);
            }
        };

        window.addEventListener('dragonsLoaded', handleDragonsLoaded as EventListener);
        
        return () => {
            window.removeEventListener('dragonsLoaded', handleDragonsLoaded as EventListener);
        };
    }, []);

    // Load dragons on mount (with delay as fallback if event doesn't fire)
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only fetch if we don't have dragons yet
            if (ownedDragons.length === 0) {
                refreshDragons();
            }
        }, 2500); // Wait for user identification to complete
        
        return () => clearTimeout(timer);
    }, [refreshDragons]);

    // Collect all pending embers
    const collectAllEmbers = useCallback(async () => {
        if (isCollecting || pendingEmbers === 0) return;

        setIsCollecting(true);
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "collect-dragon-embers" }),
            });
            const data = await response.json();
            
            if (data.ok) {
                // Update local state
                setOwnedDragons(data.ownedDragons || []);
                setPendingEmbers(0);
                
                // Update ember context
                if (data.wallet?.embers !== undefined) {
                    setEmbers(data.wallet.embers);
                }

                // Process completed quests if any
                if (data.completedQuests && data.completedQuests.length > 0) {
                    window.dispatchEvent(new CustomEvent('questsCompleted', { 
                        detail: { completedQuests: data.completedQuests } 
                    }));
                }
            }
        } catch (error) {
            console.error("Error collecting embers:", error);
        } finally {
            setIsCollecting(false);
        }
    }, [isCollecting, pendingEmbers, setEmbers]);

    // Purchase a dragon
    const purchaseDragon = useCallback(async (dragonId: string, price: number): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    action: "purchase-dragon",
                    dragonId,
                    price,
                }),
            });
            const data = await response.json();
            
            if (data.ok) {
                setOwnedDragons(data.ownedDragons || []);
                
                // Update ember context
                if (data.wallet?.embers !== undefined) {
                    setEmbers(data.wallet.embers);
                }

                // Process completed quests
                if (data.completedQuests && data.completedQuests.length > 0) {
                    window.dispatchEvent(new CustomEvent('questsCompleted', { 
                        detail: { completedQuests: data.completedQuests } 
                    }));
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error("Error purchasing dragon:", error);
            return false;
        }
    }, [setEmbers]);

    // Upgrade a dragon
    const upgradeDragon = useCallback(async (dragonId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    action: "upgrade-dragon",
                    dragonId,
                }),
            });
            const data = await response.json();
            
            if (data.ok) {
                // Update the specific dragon in state
                setOwnedDragons(prev => 
                    prev.map(d => 
                        d.dragonId === dragonId 
                            ? { ...d, level: data.dragon.level }
                            : d
                    )
                );
                
                // Update ember context
                if (data.wallet?.embers !== undefined) {
                    setEmbers(data.wallet.embers);
                }

                // Process completed quests if any
                if (data.completedQuests && data.completedQuests.length > 0) {
                    window.dispatchEvent(new CustomEvent('questsCompleted', { 
                        detail: { completedQuests: data.completedQuests } 
                    }));
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error("Error upgrading dragon:", error);
            return false;
        }
    }, [setEmbers]);

    return (
        <DragonContext.Provider
            value={{
                ownedDragons,
                dragonsWithDetails,
                pendingEmbers,
                isCollecting,
                refreshDragons,
                collectAllEmbers,
                purchaseDragon,
                upgradeDragon,
            }}
        >
            {children}
        </DragonContext.Provider>
    );
}

export function useDragons() {
    const ctx = useContext(DragonContext);
    if (!ctx) throw new Error("useDragons must be used inside DragonProvider");
    return ctx;
}
