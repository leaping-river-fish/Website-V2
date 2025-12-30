import { motion } from "framer-motion";

type ShopCardProps = {
    title: string;
    description: string;
    comingSoon?: boolean;
};

export default function ShopCard({
    title,
    description,
    comingSoon,
}: ShopCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="relative rounded-2xl border border-neutral-800 bg-neutral-900 p-6 overflow-hidden"
            style={{
                border: "1px solid var(--flame-glow)",
                boxShadow: "0 0 8px var(--flame-glow), 0 0 16px var(--flame-accent)",
                transition: "box-shadow 0.3s, border-color 0.3s",
            }}
        >
            {comingSoon && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-sm uppercase tracking-widest text-neutral-400">
                    Coming Soon
                </div>
            )}

            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-neutral-400">{description}</p>
        </motion.div>
    );
}