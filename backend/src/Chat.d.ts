import mongoose from "mongoose";

interface ChatDocument extends mongoose.Document {
    question: string;
    answer: string;
    embedding?: number[];
    createdAt: Date;
}

declare const Chat: mongoose.Model<ChatDocument>;
export default Chat;