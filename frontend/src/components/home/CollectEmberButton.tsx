import { motion, AnimatePresence } from "framer-motion";
import { useDragons } from "../../contexts/DragonContext";
import { useFlameTheme } from "../../contexts/FlameThemeContext";
import EmberIcon from "../navbar/EmberIcon";

export function CollectEmberButton() {
    const { pendingEmbers, isCollecting, collectAllEmbers } = useDragons();
    const { themeId } = useFlameTheme();
    
    const isPureFlame = themeId === "flame:pure";
    const buttonTextColor = getComputedStyle(document.documentElement).getPropertyValue('--flame-button-text').trim() || "#ffffff";

    if (pendingEmbers === 0) return null;

    return (
        <AnimatePresence>
            <motion.button
                data-tutorial-id="collect-ember-button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: [0, -5, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                    y: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                }}
                onClick={collectAllEmbers}
                disabled={isCollecting}
                className="fixed bottom-8 right-8 z-50 pointer-events-auto cursor-pointer"
                style={{
                    background: "linear-gradient(135deg, var(--flame-primary) 0%, var(--flame-accent) 100%)",
                    boxShadow: "0 0 20px var(--flame-glow), 0 0 40px var(--flame-accent)",
                }}
            >
                <div className="relative px-6 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg" style={{ color: "var(--flame-button-text)" }}>
                    {/* Pulsing glow effect */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            background: "radial-gradient(circle, var(--flame-accent) 0%, transparent 70%)",
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Content */}
                    <div className="relative flex items-center gap-3">
                        <div style={{ 
                            filter: isPureFlame ? "drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(0,0,0,0.6))" : "none" 
                        }}>
                            <EmberIcon size={24} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs opacity-80">Collect</span>
                            <motion.span
                                key={pendingEmbers}
                                initial={{ 
                                    scale: 1.2, 
                                    color: isPureFlame ? "#FFD700" : "#FFD700" 
                                }}
                                animate={{ 
                                    scale: 1, 
                                    color: buttonTextColor
                                }}
                                transition={{ duration: 0.3 }}
                                className="text-xl font-bold"
                            >
                                +{pendingEmbers}
                            </motion.span>
                        </div>
                    </div>

                    {/* Sparkle particles */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: "var(--flame-accent)",
                                boxShadow: "0 0 4px var(--flame-glow)",
                            }}
                            animate={{
                                x: [0, (Math.random() - 0.5) * 40],
                                y: [0, -20 - Math.random() * 20],
                                opacity: [1, 0],
                                scale: [1, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </div>
            </motion.button>
        </AnimatePresence>
    );
}
