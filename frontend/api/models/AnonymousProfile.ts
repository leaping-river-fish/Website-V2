import mongoose, { Schema, Document } from "mongoose";

export interface Quest {
    questId: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
}

export interface Wallet {
    embers: number;
    totalEarned: number;
    totalSpent: number;
}

export interface AnonymousProfileDoc extends Document {
    anonId: string;
    env: "dev" | "prod";
    introGameCompleted: boolean;
    quests: Quest[];
    wallet: Wallet;
    createdAt: Date;
    lastSeen: Date;
}

const QuestSchema: Schema<Quest> = new mongoose.Schema({
    questId: { type: String, required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
});

const WalletSchema: Schema<Wallet> = new mongoose.Schema(
    {
        embers: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
    },
    { _id: false }
);

const AnonymousProfileSchema: Schema<AnonymousProfileDoc> = new mongoose.Schema({
    anonId: { type: String, required: true },
    env: { type: String, enum: ["dev", "prod"], required: true, index: true },
    wallet: { type: WalletSchema, default: () => ({}) },
    introGameCompleted: { type: Boolean, default: false },
    quests: { type: [QuestSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
});

AnonymousProfileSchema.index({ anonId: 1, env: 1 }, { unique: true });

export default mongoose.models.AnonymousProfile ||
    mongoose.model<AnonymousProfileDoc>("AnonymousProfile", AnonymousProfileSchema);