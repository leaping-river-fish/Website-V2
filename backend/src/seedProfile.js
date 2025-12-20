import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "./Profile.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const profileName = "Nick Zheng";

// Make sure the document exists
let existing = await Profile.findOne({ name: profileName });

const updateData = {
    values: [
        "continuous learning",
        "collaboration",
        "honesty",
        "building useful things",
        "hardwork",
        "family",
        "friends"
    ],
    workStyle: {
        prefersTeamwork: true,
        likesAutonomy: true,
        learningStyle: "hands-on",
        feedbackStyle: "direct"
    },
    strengths: ["quick learner", "adaptable", "reliable"],
    growthAreas: ["stress management", "overthinking"],
    creativeInterests: ["drawing", "game design"],
    mediaPreferences: {
        games: ["MOBAs", "Sandbox"],
        genres: ["fantasy", "sci-fi"]
    },
    professional: {
        currentStatus: "university student",
        primaryRoles: ["Full-Stack developer", "QA engineer"],
        industries: ["tech", "ai", "software"]
    },
    techStack: {
        languages: ["JavaScript", "TypeScript", "Python", "C++"],
        frameworks: ["React", "Node.js", "Express"],
        testing: ["Selenium", "Appium"],
        databases: ["MongoDB", "Redis", "PostgresQL"],
        tools: ["Git", "Vercel"]
    },
    education: {
        level: "university",
        field: "systems design engineering",
        status: "in progress"
    }
};

if (existing) {
    const result = await Profile.updateOne(
        { _id: existing._id },
        { $set: updateData }
    );
    console.log("✔ Profile updated");
    console.log("Matched count:", result.matchedCount, "Modified count:", result.modifiedCount);
} else {
    await Profile.create({
        name: profileName,
        location: {
            city: "East Gwillimbury",
            province: "Ontario",
            country: "Canada"
        },
        bio: {
            short: "University student passionate about web and app development.",
            long: "Nick Zheng is the eldest of four siblings, a quick learner, and a well-rounded individual who enjoys building creative applications and meeting new people."
        },
        interests: [
            "volleyball",
            "badminton",
            "ultimate frisbee",
            "drawing dragons",
            "coding",
            "machine learning",
            "ai"
        ],
        motivation: [
            "learning new skills",
            "meeting new people",
            "working with coworkers"
        ],
        personality: {
            social: true,
            stressProne: true,
            coping: ["walking", "stretching", "talking to friends or coworkers"]
        },
        goals: {
            fiveYear: {
                role: "developer",
                industries: ["gaming", "lifestyle"]
            }
        },
        ...updateData
    });
    console.log("✔ Profile seeded");
}

const updatedProfile = await Profile.findOne({ name: profileName });
console.log("Updated Profile:", updatedProfile);

mongoose.disconnect();