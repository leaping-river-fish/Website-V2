export type DragonRarity = "common" | "rare" | "epic" | "legendary";

export interface DragonType {
    id: string;
    name: string;
    description: string;
    price?: number; 
    rarity: DragonRarity;
    canFly: boolean;
    facesLeft: boolean; // Whether the dragon's default image faces left
    baseGenerationRate: number; 
    imagePath: string;
}

export interface OwnedDragon {
    dragonId: string;
    level: number;
    acquiredAt: Date;
    totalGenerated: number;
    lastCollectedAt?: Date;
}

export interface DragonWithDetails extends OwnedDragon {
    details: DragonType;
}
