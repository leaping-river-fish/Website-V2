import mongoose, { Document, Model, Schema } from "mongoose";

export interface ChatType extends Document {
    question: string;
    answer: string;
    embedding: number[];
    createdAt: Date;
}

const ChatSchema: Schema<ChatType> = new Schema({
    question: { type: String, unique: true, required: true },
    answer: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now },
});

const Chat: Model<ChatType> = mongoose.models.Chat || mongoose.model<ChatType>("Chat", ChatSchema);

export default Chat;