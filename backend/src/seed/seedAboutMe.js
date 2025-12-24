import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import AboutMe from '../schema/AboutMe.js';

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
});

const MONGODB_URI = process.env.MONGO_URI;
await mongoose.connect(MONGODB_URI);

await mongoose.connection.db.collection('aboutmes').createIndex({ question: 1 }, { unique: true }); 

// seeded information
const facts = [
    {
        question: "Who is your creator?",
        answer: "My creator is Nick Zheng, a university student with a passion for web and app development. He is always looking to create fun and creative applications."
    },

    {
        question: "Where is Nick Zheng from?",
        answer: "Nick Zheng is from East Gwillimbury, Ontario."
    },

    {
        question: "What does Nick enjoy?",
        answer: "Nick enjoys sports like volleyball, badminton, and ultimate frisbee. Additionally, he enjoys drawing dragons and coding in his free time."
    },
    
    {
        question: "Tell me about Nick.",
        answer: "As the eldest of four siblings, Nick is a quick learner, and well-rounded individual. He loves meeting new people and making new connections."
    },

    {
        question: "What is Nick's professional background?",
        answer: "Most recently, Nick has worked as a QA Engineer for RIFO Holding Group, obtaining an excellent performance grading. Nick's other professional experiences include being a restaurant host at Mi-Ne Sushi, and the vice-president of his community's Interact Rotary Club."
    },

    {
        question: "What industries has Nick worked in?",
        answer: "Nick has worked in the real estate industry and tech industry as a QA engineer for RIFO Holding Group automating tests for their real estate apps."
    },

    {
        question: "What tools or technologies is Nick proficient in?",
        answer: "Nick has worked professionally, using Python for 4+ months along with Appium and Selenium for automating test cases. Nick also has experience as a fullstack developer using React, JavaScript, CSS, Node.js and express."
    },

    {
        question: "What motivates Nick to work?",
        answer: "The opportunity to learn and meet new friends and coworkers is what motivates Nick to work and improve his skills."
    },

    {
        question: "How would colleagues describe Nick?",
        answer: "Colleagues would describe Nick as a quick, and reliable learner, able to pick up any task and complete it on time."
    },

    {
        question: "Where does Nick see himself in 5 years?",
        answer: "Nick sees himself working as a developer either in the gaming or lifestyle industry. He enjoys making his fun idea come to fruition"
    },

    {
        question: "What environment does Nick thrive in?",
        answer: "Nick thrives in a social environment with many opportunities to learn new skills and meet new people."
    },

    {
        question: "How does Nick handle stressful situations?",
        answer: "Nick is quite prone to stress, although he has made many efforts to make himself more resilient in the face of stress. Some of the ways he handles stress, include taking a walk or stretch to reset his mental state, or confiding to a coworker or friend."
    }

    // to be continued
];  

for (const fact of facts) {

    try {
        // checks if information has already been seeded, prevents duplicates
        const existingFact = await AboutMe.findOne({ question: fact.question });
        
        if (existingFact) {
            console.log(`Skipping: ${fact.question} already exists.`);
            continue;
        }

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: fact.question
        });

        await AboutMe.create({
            question: fact.question,
            answer: fact.answer,
            embedding: embedding.data[0].embedding
        });

        console.log(`Seeded: ${fact.question}`);
    } catch (err) {
        console.error("Error seeding data: ", err);
    }
}

mongoose.disconnect();