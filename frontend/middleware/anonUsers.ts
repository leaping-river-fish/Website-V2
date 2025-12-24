import { connectMongo } from "../models/mongodb";
import AnonymousProfile from "../models/AnonymousProfile";
import type { AnonymousProfileDoc } from "../models/AnonymousProfile";

export interface AnonRequest extends Request {
  anonUser?: AnonymousProfileDoc;
}

export async function anonUser(req: any, _res: any, next: () => void) {
    try {
        await connectMongo();

        const anonId = req.cookies?.anon_id;
        if (!anonId) return next();

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        const profile = await AnonymousProfile.findOne({ anonId, env });
        if (profile) {
            req.anonUser = profile;
        }

        next();
    } catch (err) {
        console.error("AnonUser middleware error:", err);
        next();
    }
}