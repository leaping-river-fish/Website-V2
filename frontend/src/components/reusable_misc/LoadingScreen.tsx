import { motion } from "framer-motion";

export default function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black"
        >
            <motion.div
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="text-white text-sm tracking-[0.35em]"
            >
                LOADING
            </motion.div>
        </motion.div>
    );
}