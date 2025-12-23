import AnonymousProfile from "../AnonymousProfile.js";

export async function anonUser(req, _res, next) {
    const anonId = req.cookies?.anon_id;
    if (!anonId) {
        req.anonUser = null;
        return next();
    }

    const profile = await AnonymousProfile.findOne({ anonId });
    req.anonUser = profile || null;

    if (profile) {
        profile.lastSeen = new Date();
        await profile.save();
    }

    next();
}

