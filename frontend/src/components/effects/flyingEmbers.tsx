import { motion } from "framer-motion";
import { useState, useCallback } from "react";

type Ember = {
    id: number;
    spawn: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    drift: number;
    type: "ash" | "ember" | "flare";
    collected?: boolean;
};

const EMBER_COUNT = 30;
const FLARE_COOLDOWN = 20_000;

/* ---------------- flare timing helpers ---------------- */

const getLastFlareTime = () =>
    Number(localStorage.getItem("lastFlareTime") || 0);

const setLastFlareTime = (time: number) =>
    localStorage.setItem("lastFlareTime", String(time));

/* ---------------- ember generator ---------------- */

const generateEmber = (id: number, spawn = 0): Ember => {
    const roll = Math.random();
    let type: Ember["type"] = "ember";

    const now = Date.now();
    const lastFlareTime = getLastFlareTime();

    if (roll > 0.99 && now - lastFlareTime > FLARE_COOLDOWN) {
        type = "flare";
        setLastFlareTime(now);
    }
    else if (roll < 0.35) {
        type = "ash";
    }

    return {
        id,
        spawn,
        left: Math.random() * 100,
        size:
            type === "flare"
                ? 7 + Math.random() * 3
                : 4 + Math.random() * 4,
        delay: Math.random() * 2,
        duration:
            type === "flare"
                ? 6 + Math.random() * 4
                : 8 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
        type,
        collected: false,
    };
};

/* ---------------- component ---------------- */

export const FlyingEmbers = () => {
    const [embers, setEmbers] = useState<Ember[]>(() =>
        Array.from({ length: EMBER_COUNT }).map((_, i) => generateEmber(i, 0))
    );

    const respawnEmber = useCallback((id: number) => {
        setEmbers((prev) =>
            prev.map((e) => (e.id === id ? generateEmber(id, e.spawn + 1) : e))
        );
    }, []);

    const handleClick = useCallback((ember: Ember) => {
        if (ember.type === "ash") {
            setEmbers(prev =>
                prev.map(e =>
                    e.id === ember.id ? { ...e, collected: true } : e
                )
            );

            setTimeout(() => {
                respawnEmber(ember.id);
            }, 500);
        } else if (ember.type === "ember") {
            setEmbers(prev =>
                prev.map(e =>
                    e.id === ember.id ? { ...e, collected: true } : e
                )
            );

            setTimeout(() => {
                setEmbers(prev =>
                    prev.map(e =>
                    e.id === ember.id ? { ...e, type: "ash", collected: false } : e
                    )
                );
            }, 500);
        } else if (ember.type === "flare") {
            setEmbers(prev =>
                prev.map(e =>
                    e.id === ember.id
                        ? { ...e, collected: true }
                        : e
                )
            );
        }
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            {embers.map((ember) => {

                const styleMap = {
                    ash: {
                        background:
                            "radial-gradient(circle, #666 0%, #333 60%, transparent 70%)",
                        boxShadow: "0 0 6px rgba(80,80,80,0.4)",
                        opacity: 0.5,
                    },
                    ember: {
                        background:
                            "radial-gradient(circle, #ff6a00 0%, #dd1818 60%, transparent 70%)",
                        boxShadow: "0 0 10px rgba(221,24,24,0.8)",
                        opacity: 0.9,
                    },
                    flare: {
                        background:
                            "radial-gradient(circle, #fff3b0 0%, #ffd700 35%, #ffae00 60%, transparent 72%)",
                        boxShadow:
                            "0 0 18px rgba(255, 200, 60, 0.9), 0 0 32px rgba(255, 160, 0, 0.6)",
                        opacity: 1,
                    },
                };

                return (
                    <motion.div
                        key={`${ember.id}-${ember.spawn}`}
                        className={"absolute rounded-full pointer-events-none"}
                        style={{
                            width: ember.size,
                            height: ember.size,
                            left: `${ember.left}%`,
                            position: "absolute",
                            ...styleMap[ember.type],
                        }}
                        animate={{
                            y: ["110vh", "-15vh"],
                            x: [0, ember.drift],
                            opacity: [0, 1, 0],
                            scale:
                                ember.type === "flare" && ember.collected
                                    ? [1, 1.5, 0]
                                    : ember.type === "flare"
                                        ? [1, 1.5, 1]
                                        : ember.type === "ember" && ember.collected
                                            ? [1, 2, 0]
                                            : [1, 1.2, 0.9],
                        }}
                        transition={{
                            duration: ember.duration,
                            delay: ember.delay,
                            ease: "linear",
                        }}
                        onAnimationComplete={() => respawnEmber(ember.id)}
                    >
                        <div
                            className="absolute inset-0 pointer-events-auto cursor-pointer"
                            style={{
                                width: ember.size + 10,
                                height: ember.size + 10,
                                marginLeft: -(10 / 2),
                                marginTop: -(10 / 2),
                                borderRadius: "50%",
                            }}
                            onClick={() => handleClick(ember)}
                        />

                        {/* FLARE ANIMATION */}
                        {ember.type === "flare" && ember.collected && (
                            <motion.div
                                className="absolute rounded-full bg-yellow-400"
                                style={{
                                    width: ember.size * 2,
                                    height: ember.size * 2,
                                    top: -ember.size / 2,
                                    left: -ember.size / 2,
                                    boxShadow: "0 0 20px 10px rgba(255,200,60,0.7)",
                                }}
                                initial={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 8, opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        )}

                        {ember.type === "flare" && ember.collected &&
                            Array.from({ length: 10 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-yellow-300"
                                    style={{
                                        width: 4,
                                        height: 4,
                                        top: ember.size,
                                        left: ember.size,
                                    }}
                                    initial={{ opacity: 1 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 120,
                                        y: (Math.random() - 0.5) * 120,
                                        opacity: 0,
                                    }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            ))}

                        {/* EMBER ANIMATION */}
                        {ember.type === "ember" && ember.collected && (
                            <>
                                <motion.div
                                    className="absolute rounded-full bg-[#dd1818]"
                                    style={{
                                        width: ember.size,
                                        height: ember.size,
                                        top: -ember.size / 2,
                                        left: -ember.size / 2,
                                        boxShadow: "0 10px 8px rgba(221,24,24,0.8)",
                                        transformOrigin: "50% 50%",
                                    }}
                                    initial={{ scale: 1, opacity: 1 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />

                                {Array.from({ length: 4 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full bg-[#dd1818]"
                                        style={{
                                            width: 4,
                                            height: 4,
                                            top: ember.size,
                                            left: ember.size,
                                            transformOrigin: "50% 50%",
                                        }}
                                        initial={{ opacity: 1 }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 40,
                                            y: (Math.random() - 0.5) * 40,
                                            opacity: 0,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                ))}
                            </>
                        )}

                        {/* ASH ANIMATION */}
                        {ember.type === "ash" && ember.collected && (
                            <>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full bg-gray-600"
                                        style={{
                                            width: 4,
                                            height: 4,
                                            top: ember.size,
                                            left: ember.size,
                                            transformOrigin: "50% 50%",
                                        }}
                                        initial={{ opacity: 1 }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 40,
                                            y: (Math.random() - 0.5) * 40,
                                            opacity: 0,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                ))}
                            </>
                        )}

                    </motion.div>
                );
            })}
        </div>
    );
}

