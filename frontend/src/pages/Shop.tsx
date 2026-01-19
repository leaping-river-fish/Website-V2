// add dragons to shop section
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EmberIcon from "../components/navbar/EmberIcon";
import ShopCard from "../components/shop/ShopCard";
import ShopSection from "../components/shop/ShopSection";
import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";
import { usePageTracking } from "../components/quests/usePageTracking";

import { FLAME_ITEMS } from "../components/shop/shopItems";
import { DRAGON_ITEMS, getRarityColor } from "../components/shop/dragonItems";
import { DragonModal } from "../components/shop/DragonModal";
import { useFlameTheme } from "../contexts/FlameThemeContext";
import { useEmbers } from "../contexts/EmberContext";
import { useDragons } from "../contexts/DragonContext";
import { useQuestTracker } from "../components/quests/useQuestTracker";

import { useDialogue } from '../contexts/DialogueContext';
import { DialogueBox } from '../components/DialogueBox';
import { shopDialogue } from '../dialogue/shop-dialogue';
import type { DragonType } from "../types/dragon";

export default function Shop() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const DEFAULT_THEME_ID = "flame:crimson";
    const [loading, setLoading] = useState(true);
    
    usePageTracking("shop");
    const { embers, setEmbers } = useEmbers();
    const { ownedDragons, purchaseDragon } = useDragons();
    const [ownedCosmetics, setOwnedCosmetics] = useState<string[]>([]);
    const [equippedThemeId, setEquippedThemeId] = useState(DEFAULT_THEME_ID);
    const { themeId, setThemeId } = useFlameTheme();
    const { processCompletedQuests } = useQuestTracker();

    // Dragon modal state
    const [selectedDragon, setSelectedDragon] = useState<DragonType | null>(null);
    const [isDragonModalOpen, setIsDragonModalOpen] = useState(false);

    // load tutorial
    const { registerTutorial, unregisterTutorial } = useDialogue();

    useEffect(() => {
        registerTutorial(shopDialogue.nodes);
        return () => unregisterTutorial();
    }, []);

    const effectiveOwned = new Set([
        DEFAULT_THEME_ID,
        ...ownedCosmetics,
    ]);

    /* -------------------- SYNC THEME STATE -------------------- */
    useEffect(() => {
        if (!themeId) return;
        setEquippedThemeId(themeId);
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
                const profile = profileData.profile;

                setOwnedCosmetics(profile?.ownedCosmetics ?? []);

                if (profile?.equipped?.flameTheme) {
                    setThemeId(profile.equipped.flameTheme); 
                    setEquippedThemeId(profile.equipped.flameTheme); 
                }
                
                if (profileData.completedQuests) {
                    await processCompletedQuests(profileData.completedQuests);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    /* -------------------- PURCHASE -------------------- */
    async function purchase(item: { id: string; price?: number }) {
        if (!item.price) return;

        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    action: "purchase",
                    itemId: item.id,
                    price: item.price,
                }),
            });
            const data = await response.json();
            
            if (!data.ok) return;
            
            setEmbers(data.wallet.embers);
            setOwnedCosmetics(data.ownedCosmetics);
            
            if (data.completedQuests) {
                await processCompletedQuests(data.completedQuests);
            }
        } catch (error) {
            console.error("Error purchasing item:", error);
        }
    }

    /* -------------------- EQUIP -------------------- */
    async function equip(themeId: string) {
        try {
            const response = await fetch(`${API_BASE}/anon-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "equip", itemId: themeId }),
            });
            const data = await response.json();
            
            if (!data.ok) return;
            
            setThemeId(themeId);
            setEquippedThemeId(themeId);
            
            if (data.completedQuests) {
                await processCompletedQuests(data.completedQuests);
            }
        } catch (error) {
            console.error("Error equipping item:", error);
        }
    }

    /* -------------------- PURCHASE DRAGON -------------------- */
    async function handlePurchaseDragon(dragon: DragonType) {
        if (!dragon.price) return;
        
        const success = await purchaseDragon(dragon.id, dragon.price);
        
        if (success) {
            // Optionally show success message
            console.log(`Successfully purchased ${dragon.name}!`);
        } else {
            alert("Failed to purchase dragon. Make sure you have enough embers.");
        }
    }

    /* -------------------- VIEW DRAGON -------------------- */
    function handleViewDragon(dragon: DragonType) {
        setSelectedDragon(dragon);
        setIsDragonModalOpen(true);
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
            className="min-h-screen px-6 py-24 bg-[#1A1410] text-white"
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
                <div data-tutorial-id="flame-themes-section">
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
                </div>
                
                <div data-tutorial-id="dragons-section">
                    <ShopSection
                        title="Dragons"
                        description="Tame Dragons to help you collect embers. (Top 5 highest level dragons are displayed on the home page.)"
                    >
                        {DRAGON_ITEMS.map(dragon => {
                            const owned = ownedDragons.some(d => d.dragonId === dragon.id);
                            const canAfford = dragon.price !== undefined && embers >= dragon.price;
                            
                            return (
                                <ShopCard
                                    key={dragon.id}
                                    title={dragon.name}
                                    description={dragon.description}
                                    price={owned ? undefined : dragon.price}
                                    owned={owned}
                                    canAfford={canAfford}
                                    onBuy={() => handlePurchaseDragon(dragon)}
                                    onView={() => handleViewDragon(dragon)}
                                    imageUrl={dragon.imagePath}
                                    rarity={dragon.rarity}
                                    rarityColor={getRarityColor(dragon.rarity)}
                                />
                            );
                        })}
                    </ShopSection>
                </div>
                
                <div data-tutorial-id="cursors-section">
                    <ShopSection
                        title="Custom Cursors"
                        description="Animated cursors forged from embers."
                    >
                        <ShopCard title="Dragon Cursor" description="Have a cute dragon pet as your cursor." comingSoon />
                    </ShopSection>
                </div>

                <ShopSection
                    title="Special Effects"
                    description="Trails, particles, and enhanced flame physics."
                >
                    <ShopCard title="Ember Trails" description="Leave fire in your wake." comingSoon />
                </ShopSection>
                
                <DialogueBox nodes={shopDialogue.nodes} />
                
                {/* Dragon Modal */}
                {selectedDragon && (
                    <DragonModal
                        dragon={selectedDragon}
                        ownedDragon={ownedDragons.find(d => d.dragonId === selectedDragon.id)}
                        isOpen={isDragonModalOpen}
                        onClose={() => {
                            setIsDragonModalOpen(false);
                            setSelectedDragon(null);
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}
