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
    onView?: () => void;
    comingSoon?: boolean;
    imageUrl?: string;
    rarity?: string;
    rarityColor?: string;
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
    onView,
    comingSoon,
    imageUrl,
    rarity,
    rarityColor,
}: ShopCardProps) {
    const canBuy = !comingSoon && !owned && price !== undefined;
    const canEquip = !comingSoon && owned && !equipped && onEquip;
    const canView = !comingSoon && owned && onView;

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
                {/* Image */}
                {imageUrl && (
                    <div className="relative mb-4 flex justify-center">
                        <img 
                            src={imageUrl} 
                            alt={title}
                            className="w-32 h-32 object-contain drop-shadow-lg"
                        />
                        {rarity && rarityColor && (
                            <span
                                className="absolute top-0 right-0 px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider"
                                style={{
                                    backgroundColor: `${rarityColor}20`,
                                    color: rarityColor,
                                    border: `1px solid ${rarityColor}`,
                                }}
                            >
                                {rarity}
                            </span>
                        )}
                    </div>
                )}
                
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

                    {canView && (
                        <button
                            onClick={onView}
                            className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition"
                        >
                            View
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}