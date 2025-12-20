import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    type: { type: String, default: "profile" },
    name: { type: String, required: true },
    location: { city: String, province: String, country: String },
    bio: { short: String, long: String },
    interests: [String],
    motivation: [String],
    personality: { social: Boolean, stressProne: Boolean, coping: [String] },
    goals: { fiveYear: { role: String, industries: [String] } },
    professional: { currentStatus: String, primaryRoles: [String], industries: [String] },
    techStack: { languages: [String], frameworks: [String], testing: [String], databases: [String], tools: [String] },
    values: [String],
    education: { level: String, field: String, status: String },
    workStyle: { prefersTeamwork: Boolean, likesAutonomy: Boolean, learningStyle: String, feedbackStyle: String },
    strengths: [String],
    growthAreas: [String],
    creativeInterests: [String],
    mediaPreferences: { games: [String], genres: [String] },
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;