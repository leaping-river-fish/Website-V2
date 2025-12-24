import { connectMongo } from "../models/mongodb";
import AnonymousProfile from "../models/AnonymousProfile";

interface Req {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

interface Res {
  status: (code: number) => Res;
  json: (body: any) => void;
}

export default async function handler(req: Req, res: Res) {
    try {
        await connectMongo();

        const cookiesHeader = req.headers?.cookie || "";
        const cookies = Object.fromEntries(
        cookiesHeader
            .split(";")
            .map(c => c.trim().split("="))
            .map(([k, v]) => [k, decodeURIComponent(v)])
        );

        const anonId = cookies["anon_id"];
        if (!anonId) {
        return res.status(400).json({ error: "Missing anon_id" });
        }

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

        await AnonymousProfile.findOneAndUpdate(
        { anonId, env },
        { introGameCompleted: true, lastSeen: new Date() }
        );

        res.status(200).json({ ok: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error in /api/intro-complete:", message);
        res.status(500).json({ error: message });
    }
}