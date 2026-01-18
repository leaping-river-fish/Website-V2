import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./transition.css";

interface GridTransitionProps {
    trigger: boolean;
    onComplete?: () => void;
}

const GridTransition: React.FC<GridTransitionProps> = ({ trigger, onComplete }) => {
    const rows = 8;
    const cols = 12;
    const [phase, setPhase] = useState<"hidden" | "bubbleUp" | "bubbleDown">("hidden");

    // Generate tiles array once
    const tiles = useMemo(() => {
        return Array.from({ length: rows * cols }, (_, i) => ({
            row: Math.floor(i / cols),
            col: i % cols,
            key: i
        }));
    }, [rows, cols]);

    // Handle animation phases
    useEffect(() => {
        if (!trigger) {
            setPhase("hidden");
            return;
        }

        // Start bubble up
        setPhase("bubbleUp");

        // Calculate when bubble up completes
        const maxBubbleUpDelay = ((rows + cols) * 40) + 600;

        // Call onComplete and start bubble down at the same time
        // This changes the page while tiles are still covering, then reveals it
        const bubbleDownTimer = setTimeout(() => {
            onComplete?.(); // Change page first
            setPhase("bubbleDown"); // Then reveal it
        }, maxBubbleUpDelay + 100);

        // Reset to hidden
        const resetTimer = setTimeout(() => {
            setPhase("hidden");
        }, maxBubbleUpDelay + 100 + ((rows + cols) * 40) + 600);

        return () => {
            clearTimeout(bubbleDownTimer);
            clearTimeout(resetTimer);
        };
    }, [trigger, onComplete, rows, cols]);

    return (
        <div className="transition-grid">
            {tiles.map(({ row, col, key }) => {
                const bubbleUpDelay = ((rows - row) + (cols - col)) * 0.04;
                const bubbleDownDelay = (row + col) * 0.04;

                return (
                    <motion.div
                        key={key}
                        className="tile"
                        style={{ 
                            willChange: "transform, opacity"
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                            phase === "bubbleUp" 
                                ? { scale: 1.5, opacity: 1 }
                                : phase === "bubbleDown"
                                ? { scale: 0, opacity: 0 }
                                : { scale: 0, opacity: 0 }
                        }
                        transition={
                            phase === "bubbleUp"
                                ? { duration: 0.6, delay: bubbleUpDelay, ease: "easeOut" }
                                : phase === "bubbleDown"
                                ? { duration: 0.6, delay: bubbleDownDelay, ease: "easeIn" }
                                : { duration: 0 }
                        }
                    />
                );
            })}
        </div>
    );
};

export default GridTransition;