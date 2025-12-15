import mongoose from "mongoose";

interface AboutMeDocument extends mongoose.Document {
    question: string;
    answer: string;
    embedding?: number[];
    createdAt: Date;
}

declare const AboutMe: mongoose.Model<AboutMeDocument>;
export default AboutMe;