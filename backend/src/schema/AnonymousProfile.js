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

    introGameCompleted: {
        type: Boolean,
        default: false,
    },

    quests: {
        type: [QuestSchema],
        default: [],
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    lastSeen: Date,
});

AnonymousProfileSchema.index({ anonId: 1, env: 1 }, { unique: true });

export default mongoose.model(
    "AnonymousProfile",
    AnonymousProfileSchema
);