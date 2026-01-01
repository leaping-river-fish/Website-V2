export type ShopItem = {
    id: string;
    title: string;
    description: string;
    price?: number;
};

export const FLAME_ITEMS: ShopItem[] = [
    {
        id: "flame:crimson",
        title: "Crimson Flame",
        description:
            "A deep red flame that burns hot and steady. Reliable, powerful, and everburning.",
    },
    {
        id: "flame:gold",
        title: "Gold Flame",
        price: 1000,
        description:
            "A radiant golden flame that burns hotter than crimson, concentrating intense heat into a refined, searing core.",
    },
    {
        id: "flame:emerald",
        title: "Emerald Flame",
        price: 2000,
        description:
            "A vivid emerald flame that burns with unstable intensity, radiating searing heat that strains the limits of combustion.",
    },
    {
        id: "flame:azure",
        title: "Azure Flame",
        price: 4000,
        description:
            "A piercing azure flame that burns with relentless intensity, emitting heat so severe it feels almost unnatural.",
    },
    {
        id: "flame:violet",
        title: "Violet Flame",
        price: 8000,
        description:
            "A luminous violet flame infused with arcane energy, radiating heat so powerful it bends the fabric of reality.",
    },
    {
        id: "flame:pure",
        title: "Pure Flame",
        price: 16000,
        description:
            "A blinding white flame of absolute purity, burning at the highest possible temperature. Nothing burns hotter.",
    },
];