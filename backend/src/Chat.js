import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  question: { type: String, unique: true },
  answer: String,
  embedding: [Number],
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;