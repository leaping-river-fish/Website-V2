import { Flame } from "lucide-react";
import { motion } from "framer-motion";

type EmberIconProps = {
    size?: number;
};

export default function EmberIcon({ size = 20 }: EmberIconProps) {
    return (
        <motion.div
            className="relative pointer-events-none"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
        {/* GLOW LAYER */}
            <div
                className="absolute -inset-1.5 z-0"
                style={{
                    filter: "blur(8px)",
                    color: "var(--flame-icon-glow)",
                }}
            >
                <Flame
                    className="opacity-70"
                    style={{ width: size, height: size }}
                    fill="currentColor"
                />
            </div>

            {/* MAIN FLAME */}
            <Flame
                className="relative z-10"
                fill="currentColor"
                style={{
                    width: size,
                    height: size,
                    color: "var(--flame-icon-primary)",
                    filter: "drop-shadow(0 0 6px var(--flame-icon-glow))",
                }}
            />

            {/* SMALL YELLOW EMBER */}
            <div
                className="absolute z-20"
                style={{
                    bottom: -size * 0.15,
                    left: size * 0.4,
                }}
            >
                <Flame
                    fill="currentColor"
                    style={{
                        width: size * 0.65,
                        height: size * 0.65,
                        color: "var(--flame-icon-accent)",
                        filter: "drop-shadow(0 0 4px var(--flame-icon-glow))",
                    }}
                />
            </div>
        </motion.div>
    );
}
