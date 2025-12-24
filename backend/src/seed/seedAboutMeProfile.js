import mongoose from "mongoose";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import Profile from "../schema/Profile.js";
import AboutMe from "../schema/AboutMe.js";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION
});

async function seedAboutMeFromProfile() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✔ MongoDB connected");

    const profile = await Profile.findOne({ name: "Nick Zheng" });
    if (!profile) {
        console.error("⚠ No profile found — aborting seed");
        process.exit(1);
    }

    // Map Profile fields to Q/A pairs
    const facts = [];

    // Basic info
    if (profile.location?.city && profile.location?.province) {
        facts.push({
            question: "Where is Nick from?",
            answer: `Nick is from ${profile.location.city}, ${profile.location.province}.`,
            linkedProfileField: "location"
        });
    }

    if (profile.education) {
        facts.push({
            question: "What is Nick’s educational background?",
            answer: `Nick is studying ${profile.education.field} at ${profile.education.level} level (${profile.education.status}).`,
            linkedProfileField: "education"
        });
    }

    if (profile.bio?.short) {
        facts.push({
            question: "Tell me a short bio about Nick.",
            answer: profile.bio.short,
            linkedProfileField: "bio.short"
        });
    }

    if (profile.bio?.long) {
        facts.push({
            question: "Tell me about Nick in detail.",
            answer: profile.bio.long,
            linkedProfileField: "bio.long"
        });
    }

    // Hobbies / interests
    const hobbies = [
        ...(profile.interests || []),
        ...(profile.creativeInterests || []),
        ...(profile.mediaPreferences?.games || [])
    ];
    if (hobbies.length) {
        facts.push({
            question: "What does Nick enjoy doing?",
            answer: `Nick enjoys ${hobbies.join(", ")}.`,
            linkedProfileField: "interests/creative/media"
        });
    }

    if (profile.values?.length) {
        facts.push({
            question: "What are Nick’s values?",
            answer: profile.values.join(", "),
            linkedProfileField: "values"
        });
    }

    // Professional
    if (profile.professional) {
        const roles = profile.professional.primaryRoles?.join(", ") || "";
        const industries = profile.professional.industries?.join(", ") || "";
        const status = profile.professional.currentStatus || "";
        const answerParts = [status, roles, industries].filter(Boolean).join("; ");
        facts.push({
            question: "What is Nick's professional background?",
            answer: answerParts,
            linkedProfileField: "professional"
        });
    }

    // Skills / tools
    const techStack = [];
    if (profile.techStack?.languages?.length) techStack.push(`Languages: ${profile.techStack.languages.join(", ")}`);
    if (profile.techStack?.frameworks?.length) techStack.push(`Frameworks: ${profile.techStack.frameworks.join(", ")}`);
    if (profile.techStack?.testing?.length) techStack.push(`Testing: ${profile.techStack.testing.join(", ")}`);
    if (profile.techStack?.databases?.length) techStack.push(`Databases: ${profile.techStack.databases.join(", ")}`);
    if (profile.techStack?.tools?.length) techStack.push(`Tools: ${profile.techStack.tools.join(", ")}`);
    if (techStack.length) {
        facts.push({
            question: "What tools and technologies is Nick proficient in?",
            answer: techStack.join("; "),
            linkedProfileField: "techStack"
        });
    }

    // Motivation
    if (profile.motivation?.length) {
        facts.push({
            question: "What motivates Nick?",
            answer: profile.motivation.join(", "),
            linkedProfileField: "motivation"
        });
    }

    // Goals
    if (profile.goals?.fiveYear) {
        facts.push({
            question: "Where does Nick see himself in 5 years?",
            answer: `Nick sees himself working as a ${profile.goals.fiveYear.role} in the ${profile.goals.fiveYear.industries.join(" and ")} industry.`,
            linkedProfileField: "goals.fiveYear"
        });
    }

    // Personality
    const personalityParts = [];
    if (profile.personality?.social) personalityParts.push("social");
    if (profile.personality?.stressProne) personalityParts.push("prone to stress");
    if (profile.personality?.coping?.length) personalityParts.push(`handles stress by ${profile.personality.coping.join(", ")}`);
    if (personalityParts.length) {
        facts.push({
            question: "How would colleagues describe Nick?",
            answer: personalityParts.join("; "),
            linkedProfileField: "personality"
        });
    }

    if (profile.workStyle) {
        const parts = [];
        if (profile.workStyle.prefersTeamwork) parts.push("prefers teamwork");
        if (profile.workStyle.likesAutonomy) parts.push("likes autonomy");
        if (profile.workStyle.learningStyle) parts.push(`learning style: ${profile.workStyle.learningStyle}`);
        if (profile.workStyle.feedbackStyle) parts.push(`feedback style: ${profile.workStyle.feedbackStyle}`);
        if (parts.length) {
            facts.push({
                question: "What is Nick’s work style?",
                answer: parts.join("; "),
                linkedProfileField: "workStyle"
            });
        }
    }

    if (profile.strengths?.length) {
        facts.push({
            question: "What are Nick’s strengths?",
            answer: profile.strengths.join(", "),
            linkedProfileField: "strengths"
        });
    }

    // Growth areas
    if (profile.growthAreas?.length) {
        facts.push({
            question: "What are Nick’s growth areas?",
            answer: profile.growthAreas.join(", "),
            linkedProfileField: "growthAreas"
        });
    }

    // Seed into AboutMe
    for (const fact of facts) {
        try {
            const exists = await AboutMe.findOne({ question: fact.question });
            if (exists) {
                console.log(`Skipping: ${fact.question} already exists`);
                continue;
            }

            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: fact.question
            });

            await AboutMe.create({
                ...fact,
                embedding: embeddingResponse.data[0].embedding,
                source: "profile",
                confidence: 1.0
            });

            console.log(`Seeded: ${fact.question}`);
        } catch (err) {
            console.error("Error seeding fact:", fact.question, err);
        }
    }

    console.log("✔ Profile → AboutMe seeding complete");
    await mongoose.disconnect();
}

seedAboutMeFromProfile().catch(err => {
    console.error(err);
    mongoose.disconnect();
});