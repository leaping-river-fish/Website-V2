import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);

        isConnected = true;
        console.log("MongoDB connected (dev)");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
}