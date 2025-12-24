import mongoose, { Document, Model, Schema } from "mongoose";

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

const AboutMe: Model<AboutMeType> =
    mongoose.models.AboutMe ||
    mongoose.model<AboutMeType>("AboutMe", AboutMeSchema);

export default AboutMe;