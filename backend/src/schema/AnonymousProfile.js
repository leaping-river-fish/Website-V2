import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema(
    {
        questId: { type: String, required: true },
        progress: { type: Number, default: 0, min: 0 },
        completed: { type: Boolean, default: false },
        completedAt: Date,
    },
    { _id: false }
);

const OwnedDragonSchema = new mongoose.Schema(
    {
        dragonId: { type: String, required: true },
        level: { type: Number, default: 1, min: 1 },
        acquiredAt: { type: Date, default: Date.now },
        totalGenerated: { type: Number, default: 0 },
        lastCollectedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const AnonymousProfileSchema = new mongoose.Schema({
    anonId: {
        type: String,
        required: true,
    },

    env: {
        type: String,
        enum: ["dev", "prod"],
        required: true,
        index: true,
    },

    wallet: {
        embers: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
    },

    ownedCosmetics: {
        type: [String],
        default: [],
        index: true,
    },

    equipped: {
        flameTheme: {
            type: String,
            default: null,
        },
    },

    introGameCompleted: {
        type: Boolean,
        default: false,
    },

    tutorialCompleted: {
        type: Boolean,
        default: false,
    },

    quests: {
        type: [QuestSchema],
        default: [],
    },

    ownedDragons: {
        type: [OwnedDragonSchema],
        default: [],
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    lastSeen: Date,
});

AnonymousProfileSchema.index({ anonId: 1, env: 1 }, { unique: true });

export default mongoose.models.AnonymousProfile || mongoose.model(
    "AnonymousProfile",
    AnonymousProfileSchema
);