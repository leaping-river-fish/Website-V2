import AnonymousProfile from "../schema/AnonymousProfile.js";
import { updateQuestProgress } from "../quests/questService.js";

// Helper to get current date in EST as "YYYY-MM-DD" string
function getCurrentESTDate() {
    const dateStr = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    // Convert "MM/DD/YYYY" to "YYYY-MM-DD"
    const [month, day, year] = dateStr.split(',')[0].split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

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
        
        // Track unique days visited (EST timezone)
        const todayEST = getCurrentESTDate();
        const lastLoginDate = profile.lastLoginDate;
        
        // Initialize fields for existing users
        if (profile.uniqueDaysVisited === undefined) {
            profile.uniqueDaysVisited = 0;
        }
        
        let isNewDay = false;
        if (lastLoginDate !== todayEST) {
            // First login of this day (EST)
            profile.uniqueDaysVisited += 1;
            profile.lastLoginDate = todayEST;
            isNewDay = true;
        }
        
        await profile.save();
        
        // Update daily visitor quests if it's a new day
        if (isNewDay) {
            try {
                // Update both daily visitor quests (this will check for completion)
                await updateQuestProgress(anonId, profile.env, "daily_visitor", 0);
                await updateQuestProgress(anonId, profile.env, "weekly_visitor", 0);
            } catch (error) {
                console.error("[Daily Visitor Quest] Error updating quests:", error);
            }
        }
    }

    next();
}

