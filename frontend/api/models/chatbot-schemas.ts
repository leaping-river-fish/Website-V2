import mongoose, { Document, Model, Schema } from "mongoose";

// ============= ABOUTME SCHEMA =============

export type AboutMeSource = "manual" | "profile";

export interface AboutMeType extends Document {
    question: string;
    answer: string;
    embedding: number[];
    source: AboutMeSource;
    confidence: number;
    linkedProfileField?: string;
    createdAt: Date;
}

const AboutMeSchema: Schema<AboutMeType> = new Schema({
    question: {
        type: String,
        unique: true,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
    source: {
        type: String,
        enum: ["manual", "profile"],
        default: "manual",
    },
    confidence: {
        type: Number,
        default: 1.0,
    },
    linkedProfileField: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const AboutMe: Model<AboutMeType> =
    mongoose.models.AboutMe ||
    mongoose.model<AboutMeType>("AboutMe", AboutMeSchema);


// ============= PROFILE SCHEMA =============

export interface ProfileType extends Document {
    type: string;
    name: string;
    location?: {
        city?: string;
        province?: string;
        country?: string;
    };
    bio?: {
        short?: string;
        long?: string;
    };
    interests?: string[];
    motivation?: string[];
    personality?: {
        social?: boolean;
        stressProne?: boolean;
        coping?: string[];
    };
    goals?: {
        fiveYear?: {
            role?: string;
            industries?: string[];
        };
    };
    professional?: {
        currentStatus?: string;
        primaryRoles?: string[];
        industries?: string[];
    };
    techStack?: {
        languages?: string[];
        frameworks?: string[];
        testing?: string[];
        databases?: string[];
        tools?: string[];
    };
    values?: string[];
    education?: {
        level?: string;
        field?: string;
        status?: string;
    };
    workStyle?: {
        prefersTeamwork?: boolean;
        likesAutonomy?: boolean;
        learningStyle?: string;
        feedbackStyle?: string;
    };
    strengths?: string[];
    growthAreas?: string[];
    creativeInterests?: string[];
    mediaPreferences?: {
        games?: string[];
        genres?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema: Schema<ProfileType> = new Schema(
    {
        type: {
            type: String,
            default: "profile",
        },
        name: {
            type: String,
            required: true,
        },
        location: {
            city: String,
            province: String,
            country: String,
        },
        bio: {
            short: String,
            long: String,
        },
        interests: [String],
        motivation: [String],
        personality: {
            social: Boolean,
            stressProne: Boolean,
            coping: [String],
        },
        goals: {
            fiveYear: {
                role: String,
                industries: [String],
            },
        },
        professional: {
            currentStatus: String,
            primaryRoles: [String],
            industries: [String],
        },
        techStack: {
            languages: [String],
            frameworks: [String],
            testing: [String],
            databases: [String],
            tools: [String],
        },
        values: [String],
        education: {
            level: String,
            field: String,
            status: String,
        },
        workStyle: {
            prefersTeamwork: Boolean,
            likesAutonomy: Boolean,
            learningStyle: String,
            feedbackStyle: String,
        },
        strengths: [String],
        growthAreas: [String],
        creativeInterests: [String],
        mediaPreferences: {
            games: [String],
            genres: [String],
        },
    },
    {
        timestamps: true,
    }
);

export const Profile: Model<ProfileType> =
    mongoose.models.Profile ||
    mongoose.model<ProfileType>("Profile", ProfileSchema);


// ============= CHAT SCHEMA =============

export interface ChatType extends Document {
    question: string;
    answer: string;
    embedding: number[];
    source: string;
    confidence: number;
    createdAt: Date;
}

const ChatSchema: Schema<ChatType> = new Schema({
    question: {
        type: String,
        unique: true,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
    source: {
        type: String,
        default: "conversation",
    },
    confidence: {
        type: Number,
        default: 0.5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Chat: Model<ChatType> =
    mongoose.models.Chat ||
    mongoose.model<ChatType>("Chat", ChatSchema);
