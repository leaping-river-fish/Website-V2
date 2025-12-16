import mongoose, { Document, Model, Schema } from "mongoose";

export interface AboutMeType extends Document {
    question: string;
    answer: string;
    embedding: number[];
    createdAt: Date;
}

const AboutMeSchema: Schema<AboutMeType> = new Schema({
    question: { type: String, unique: true, required: true },
    answer: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now },
});

const AboutMe: Model<AboutMeType> = mongoose.models.AboutMe || mongoose.model<AboutMeType>("AboutMe", AboutMeSchema);

export default AboutMe;