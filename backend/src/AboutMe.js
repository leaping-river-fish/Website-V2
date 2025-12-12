import mongoose from "mongoose";

const aboutMeSchema = new mongoose.Schema({
    question: { type: String, unique: true },
    answer: String,
    embedding: [Number],
    createdAt: { type: Date, default: Date.now },
});

const AboutMe = mongoose.model("AboutMe", aboutMeSchema);

export default AboutMe;
