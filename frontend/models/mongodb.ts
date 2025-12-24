import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("❌ Please define the MONGO_URI environment variable");
}

const MONGO_URI_SAFE: string = MONGO_URI;

let cached = globalThis as unknown as {
    mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
};

if (!cached.mongoose) {
    cached.mongoose = { conn: null, promise: null };
}

export async function connectMongo(): Promise<typeof mongoose> {
    if (cached.mongoose!.conn) {
        return cached.mongoose!.conn;
    }

    if (!cached.mongoose!.promise) {
        cached.mongoose!.promise = mongoose.connect(MONGO_URI_SAFE, {
            bufferCommands: false, 
        });
    }

    try {
        cached.mongoose!.conn = await cached.mongoose!.promise;
        console.log("✔ MongoDB connected");
        return cached.mongoose!.conn;
    } catch (err) {
        cached.mongoose!.promise = null;
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}