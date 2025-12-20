import mongoose from "mongoose";

const aboutMeSchema = new mongoose.Schema({
    question: { type: String, unique: true },
    answer: String,
    embedding: [Number],

    source: {
        type: String,
        enum: ["manual", "profile"],
        default: "manual"
    },

    confidence: {
        type: Number,
        default: 1.0
    },

    linkedProfileField: String,

    createdAt: { type: Date, default: Date.now },
});

const AboutMe = mongoose.model("AboutMe", aboutMeSchema);

export default AboutMe;
