import { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type EmberContextType = {
    embers: number;
    gainTick: number;
    earnEmbers: (amount: number) => void;
    spendEmbers: (amount: number) => void;
    setEmbers: React.Dispatch<React.SetStateAction<number>>;
    refreshEmbers: () => Promise<void>;
};

const EmberContext = createContext<EmberContextType | null>(null);

export function EmberProvider({ children }: { children: React.ReactNode }) {
    const [embers, setEmbers] = useState(0);
    const [gainTick, setGainTick] = useState(0);

    // 🔥 Load wallet
    const refreshEmbers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "get-wallet" }),
            });
            const data = await response.json();
            if (typeof data?.wallet?.embers === "number") {
                setEmbers(data.wallet.embers);
                setGainTick(t => t + 1); // Trigger animation
            }
        } catch (error) {
            console.error("Error refreshing embers:", error);
        }
    }, []);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            refreshEmbers();
        }, 500);
              
        return () => clearTimeout(timer);
    }, [refreshEmbers]);

    const earnEmbers = useCallback((amount: number) => {
        setEmbers(e => e + amount);
        setGainTick(t => t + amount);

        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                action: "earn-embers",
                amount,
            }),
        }).catch(() => {
            setEmbers(e => Math.max(0, e - amount));
        });
    }, []);

    const spendEmbers = useCallback((amount: number) => {
        setEmbers(e => Math.max(0, e - amount));
        setGainTick(t => t + 1);
    }, []);

    return (
        <EmberContext.Provider
            value={{
                embers,
                gainTick,
                earnEmbers,
                spendEmbers,
                setEmbers,
                refreshEmbers,
            }}
        >
            {children}
        </EmberContext.Provider>
    );
}

export function useEmbers() {
    const ctx = useContext(EmberContext);
    if (!ctx) throw new Error("useEmbers must be used inside EmberProvider");
    return ctx;
}