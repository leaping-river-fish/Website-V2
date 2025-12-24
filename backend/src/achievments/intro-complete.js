import { connectMongo } from "../db/mongodb";
import AnonymousProfile from "../schema/AnonymousProfile";


export default async function handler(req) {
    if (req.method !== "POST") {
        return new Response(null, { status: 405 });
    }

    const anonId = req.headers.get("x-anon-id");
    if (!anonId) {
        return new Response("Missing anonId", { status: 400 });
    }

    await connectMongo();

    const env = process.env.NODE_ENV === "production" ? "prod" : "dev";

    await AnonymousProfile.updateOne(
        { anonId, env },
        { $set: { introGameCompleted: true } }
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
