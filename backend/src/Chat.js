import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    question: { type: String, unique: true },
    answer: String,
    embedding: [Number],

    source: {
        type: String,
        default: "conversation"
    },

    confidence: {
        type: Number,
        default: 0.5
    },

    createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;