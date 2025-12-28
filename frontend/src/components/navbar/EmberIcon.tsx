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
        {/* GLOW LAYER — does not affect layout */}
            <div
                className="absolute -inset-1.5 z-0"
                style={{
                    filter: "blur(8px)",
                }}
            >
                <Flame
                    className="text-orange-500 opacity-70"
                    style={{ width: size, height: size }}
                    fill="currentColor"
                />
            </div>

            {/* MAIN FLAME */}
            <Flame
                className="relative z-10 text-orange-500"
                fill="currentColor"
                style={{
                    width: size,
                    height: size,
                    filter: "drop-shadow(0 0 6px rgba(249,115,22,0.7))",
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
                    className="text-yellow-400"
                    fill="currentColor"
                    style={{
                        width: size * 0.65,
                        height: size * 0.65,
                        filter: "drop-shadow(0 0 4px rgba(250,204,21,0.7))",
                    }}
                />
            </div>
        </motion.div>
    );
}
