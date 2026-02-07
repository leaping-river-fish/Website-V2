import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DragonType, OwnedDragon } from "../../types/dragon";
import { getRarityColor } from "./dragonItems";
import EmberIcon from "../navbar/EmberIcon";
import { useDragons } from "../../contexts/DragonContext";
import { useEmbers } from "../../contexts/EmberContext";

interface DragonModalProps {
    dragon: DragonType;
    ownedDragon?: OwnedDragon;
    isOpen: boolean;
    onClose: () => void;
}

export function DragonModal({ dragon, ownedDragon, isOpen, onClose }: DragonModalProps) {
    const { upgradeDragon } = useDragons();
    const { embers } = useEmbers();
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!isOpen) return null;

    const level = ownedDragon?.level || 1;
    const upgradeCost = 1000 * level;
    const canAffordUpgrade = embers >= upgradeCost;
    
    const currentRate = dragon.baseGenerationRate * level;
    const nextRate = dragon.baseGenerationRate * (level + 1);

    const handleUpgrade = async () => {
        if (!ownedDragon || isUpgrading || !canAffordUpgrade) return;
        
        setIsUpgrading(true);
        const success = await upgradeDragon(dragon.id);
        setIsUpgrading(false);
        
        if (!success) {
            alert("Failed to upgrade dragon. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative bg-neutral-900 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto"
                    style={{
                        border: `2px solid ${getRarityColor(dragon.rarity)}`,
                        boxShadow: `0 0 30px ${getRarityColor(dragon.rarity)}40`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition text-white"
                    >
                        ✕
                    </button>

                    {/* Dragon Image */}
                    <div className="flex justify-center mb-4">
                        <motion.img
                            src={dragon.imagePath}
                            alt={dragon.name}
                            className="w-32 h-32 object-contain drop-shadow-2xl"
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, -5, 0, 5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>

                    {/* Dragon Name */}
                    <h2 className="text-2xl font-bold text-center mb-2 text-white">
                        {dragon.name}
                    </h2>

                    {/* Rarity Badge */}
                    <div className="flex justify-center mb-3">
                        <span
                            className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                            style={{
                                backgroundColor: `${getRarityColor(dragon.rarity)}20`,
                                color: getRarityColor(dragon.rarity),
                                border: `1px solid ${getRarityColor(dragon.rarity)}`,
                            }}
                        >
                            {dragon.rarity}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-neutral-400 text-center mb-4 text-sm">
                        {dragon.description}
                    </p>

                    {/* Stats */}
                    <div className="bg-neutral-800 rounded-xl p-4 mb-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Level</span>
                            <span className="text-2xl font-bold text-white">{level}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Type</span>
                            <span className="text-white font-semibold">
                                {dragon.canFly ? "Flying" : "Walking"}
                            </span>
                        </div>

                        <div className="border-t border-neutral-700 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-neutral-400">Generation Rate</span>
                                <div className="flex items-center gap-1">
                                    <EmberIcon size={16} />
                                    <span className="text-white font-bold">{currentRate}</span>
                                    <span className="text-neutral-500 text-sm">/ 10s</span>
                                </div>
                            </div>
                            
                            {ownedDragon && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Next Level</span>
                                    <div className="flex items-center gap-1">
                                        <EmberIcon size={14} />
                                        <span className="text-emerald-400 font-semibold">{nextRate}</span>
                                        <span className="text-neutral-600">/ 10s</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {ownedDragon && (
                            <div className="border-t border-neutral-700 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-400">Total Generated</span>
                                    <div className="flex items-center gap-1">
                                        <EmberIcon size={16} />
                                        <span className="text-white font-semibold">
                                            {ownedDragon.totalGenerated.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upgrade Button */}
                    {ownedDragon && (
                        <button
                            onClick={handleUpgrade}
                            disabled={!canAffordUpgrade || isUpgrading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                canAffordUpgrade && !isUpgrading
                                    ? "bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg hover:shadow-xl"
                                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                            }`}
                        >
                            {isUpgrading ? (
                                "Upgrading..."
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Upgrade to Level {level + 1}</span>
                                    <div className="flex items-center gap-1">
                                        <EmberIcon size={20} />
                                        <span>{upgradeCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
