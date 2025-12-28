import { motion, AnimatePresence } from "framer-motion";
import EmberIcon from "./EmberIcon";

type EmberCounterProps = {
    embers: number;
    onClick?: () => void;
};

export default function EmberCounter({ embers, onClick }: EmberCounterProps) {
    return (
        <motion.div
            onClick={onClick}
            className="
                relative
                flex items-center gap-2
                px-4 py-2
                rounded-full
                font-semibold
                cursor-pointer select-none
                transition-colors
                hover:bg-gray-200
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <EmberIcon size={18} />
            
            <div className="relative h-5 min-w-6 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={embers}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 text-center text-sm font-semibold text-orange-400"
                    >
                        {embers}
                    </motion.span>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
