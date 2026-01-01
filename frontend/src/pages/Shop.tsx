import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EmberIcon from "../components/navbar/EmberIcon";
import ShopCard from "../components/shop/ShopCard";
import ShopSection from "../components/shop/ShopSection";
import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";

import { FLAME_ITEMS } from "../components/shop/shopItems";
import { useFlameTheme } from "../contexts/FlameThemeContext";

export default function Shop() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const DEFAULT_THEME_ID = "flame:crimson";
    const [loading, setLoading] = useState(true);

    const [embers, setEmbers] = useState(0);
    const [ownedCosmetics, setOwnedCosmetics] = useState<string[]>([]);
    const [equippedThemeId, setEquippedThemeId] = useState(DEFAULT_THEME_ID);
    const { themeId, setThemeId } = useFlameTheme();

    const effectiveOwned = new Set([
        DEFAULT_THEME_ID,
        ...ownedCosmetics,
    ]);

    useEffect(() => {
        console.log("ownedCosmetics updated:", ownedCosmetics);
    }, [ownedCosmetics]);

    /* -------------------- SYNC THEME STATE -------------------- */
    useEffect(() => {
        if (!themeId) {
            setThemeId(DEFAULT_THEME_ID);
            setEquippedThemeId(DEFAULT_THEME_ID);
        }
        
        if (themeId) {
            setEquippedThemeId(themeId);
        }
    }, [themeId]);

    /* -------------------- LOAD PROFILE -------------------- */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Wallet
                const walletRes = await fetch(`${API_BASE}/anon-profile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action: "get-wallet" }),
                });
                const walletData = await walletRes.json();
                setEmbers(walletData.wallet?.embers ?? 0);

                // Owned cosmetics
                const profileRes = await fetch(`${API_BASE}/anon-profile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ action: "identify" }),
                });
                const profileData = await profileRes.json();
                setOwnedCosmetics(profileData.profile?.ownedCosmetics ?? []);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    /* -------------------- PURCHASE -------------------- */
    function purchase(item: { id: string; price?: number }) {
        if (!item.price) return;

        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                action: "purchase",
                itemId: item.id,
                price: item.price,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (!data.ok) return;
                setEmbers(data.wallet.embers);
                setOwnedCosmetics(data.ownedCosmetics);
            });
    }

    /* -------------------- EQUIP -------------------- */
    function equip(themeId: string) {
        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "equip", itemId: themeId }),
        })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) return;
            setThemeId(themeId);
            setEquippedThemeId(themeId);
        });
    }

    if (loading) {
        return (
            <motion.div className="min-h-screen bg-[#1A1410] flex items-center justify-center text-white text-xl">
                Loading Shop...
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen px-6 py-24 bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <NavbarSpacer />

            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-16">
                <div className="flex items-center gap-3 mb-2">
                    <EmberIcon size={28} />
                    <h1 className="text-4xl font-bold">Ember Shop</h1>
                </div>
                <p className="text-neutral-400 max-w-xl">
                    Spend embers to customize your flame, cursor, and effects.
                </p>
            </div>

            {/* SECTIONS */}
            <div className="max-w-6xl mx-auto">
                <ShopSection
                    title="Flame Color Themes"
                    description="Change the color of your embers and flame effects."
                >
                    {FLAME_ITEMS.map(item => {
                        const owned = effectiveOwned.has(item.id);
                        const equipped = item.id === equippedThemeId;
                        const canAfford = item.price !== undefined && embers >= item.price;
                        return (
                            <ShopCard
                                key={item.id}
                                title={item.title}
                                description={item.description}
                                price={owned ? undefined : item.price}
                                owned={owned}
                                equipped={equipped}
                                canAfford={canAfford}
                                onBuy={() => purchase(item)}
                                onEquip={() => equip(item.id)}
                            />
                        );
                        
                    })}
                </ShopSection>

                <ShopSection
                    title="Custom Cursors"
                    description="Animated cursors forged from embers."
                >
                    <ShopCard title="Dragon Cursor" description="Have a cute dragon pet as your cursor." comingSoon />
                </ShopSection>

                <ShopSection
                    title="Special Effects"
                    description="Trails, particles, and enhanced flame physics."
                >
                    <ShopCard title="Ember Trails" description="Leave fire in your wake." comingSoon />
                </ShopSection>
            </div>
        </motion.div>
    );
}
