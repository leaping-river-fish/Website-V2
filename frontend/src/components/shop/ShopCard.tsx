import { motion } from "framer-motion";
import EmberIcon from "../navbar/EmberIcon";

type ShopCardProps = {
    title: string;
    description: string;
    price?: number;
    owned?: boolean;
    equipped?: boolean;
    canAfford?: boolean;
    onBuy?: () => void;
    onEquip?: () => void;
    comingSoon?: boolean;
};

export default function ShopCard({
    title,
    description,
    price,
    owned,
    equipped,
    canAfford,
    onBuy,
    onEquip,
    comingSoon,
}: ShopCardProps) {
    const canBuy = !comingSoon && !owned && price !== undefined;
    const canEquip = !comingSoon && owned && !equipped;

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

            <div className="flex flex-col h-full">
                {/* Text */}
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-neutral-400 text-sm grow">
                    {description}
                </p>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between">
                    {!owned && price !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-neutral-300">
                            <EmberIcon size={16} />
                            <span>{price}</span>
                        </div>
                    )}

                    {owned && (
                        <span className="text-sm text-emerald-400 font-semibold">
                            Owned
                        </span>
                    )}

                    {owned && equipped && (
                        <button
                            disabled
                            className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-gray-600 text-gray-200 cursor-not-allowed transition"
                        >
                            Equipped
                        </button>
                    )}


                    {/* Action */}
                    {canBuy && (
                        <button
                            onClick={onBuy}
                            disabled={!canAfford}
                            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition
                                ${canAfford
                                    ? "bg-orange-600 hover:bg-orange-500"
                                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"}
                            `}
                        >
                            Buy
                        </button>
                    )}

                    {canEquip && (
                        <button
                            onClick={onEquip}
                            className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 transition"
                        >
                            Equip
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}