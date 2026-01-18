import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { FlyingEmbers } from "../components/effects/flyingEmbers";
import { usePageTracking } from "../components/quests/usePageTracking";
import { useEmbers } from "../contexts/EmberContext";
import { useQuestTracker } from "../components/quests/useQuestTracker";

import { useDialogue } from '../contexts/DialogueContext';
import { DialogueBox } from '../components/DialogueBox';
import { homeDialogue } from '../dialogue/home-dialogue';


export const Home = () => {
    
    const { registerTutorial, unregisterTutorial } = useDialogue();

    useEffect(() => {
        registerTutorial(homeDialogue.nodes);
        return () => unregisterTutorial();
    }, []);

    usePageTracking("home");
  
    const { earnEmbers } = useEmbers();
    const { processCompletedQuests } = useQuestTracker();
    const isDev = import.meta.env.DEV;

    // Listen for quest completions from ember earning
    useEffect(() => {
        const handleQuestsCompleted = (event: any) => {
            processCompletedQuests(event.detail.completedQuests);
        };

        window.addEventListener('questsCompleted', handleQuestsCompleted);
        return () => window.removeEventListener('questsCompleted', handleQuestsCompleted);
    }, [processCompletedQuests]);

    // Quote and Description Logic -------------------------------------------------------------------------------------------
    const descriptions = [
        "Nick Zheng",
        "a student at the University of Waterloo",
        "a Systems Design Engineer",
        "a Passionate Gamer",
        "a Dragon Enthusiast",
        "a Lifelong Learner"
    ];

    const quotes = [
        "'Train like you've never won, play like you've never lost'",
        "'If we keep holding onto yesterday, what will we be tomorrow?'",
        "'Even the best would fail if they kept doing the same thing'",
        "'The only difference between courage and fear is the direction that you run'",
        "'Being average at everything is above average'",
    ];

    const [currentDescription, setCurrentDescription] = useState<string>(descriptions[0]);
    const [currentQuote, setCurrentQuote] = useState<string>(quotes[0]);
    const [indexD, setIndexD] = useState(0);
    const [indexQ, setIndexQ] = useState(0);
    const DESCTIMER = 6000;
    const QUOTETIMER = 10000;

    useEffect(() => {
        const intervalDescription = setInterval(() => {
            setIndexD((prevIndex) => (prevIndex + 1) % descriptions.length)
        }, DESCTIMER);

        return () => clearInterval(intervalDescription);
    }, []);

    useEffect(() => {
        const intervalQuote = setInterval(() => {
            setIndexQ((prevIndex) => (prevIndex + 1) % quotes.length)
        }, QUOTETIMER)

        return () => clearInterval(intervalQuote);
    }, []);

    useEffect(() => {
        setCurrentDescription(descriptions[indexD]);
    }, [indexD])

    useEffect(() => {
        setCurrentQuote(quotes[indexQ]);
    })

    return (
        <div className="relative bg-[#1A1410] min-h-screen overflow-hidden w-screen flex items-start justify-start pointer-events-none">
            <FlyingEmbers onEarn={earnEmbers} />
            <div className="flex flex-col items-start justify-start w-full h-[70%] mt-[5%] px-16">
                <div className="relative pt-[140px] text-white space-y-6 z-10">
                    <p className="">Hello,</p>

                    <div className="min-h-40 sm:min-h-[100px] md:min-h-[180px] flex items-start">
                        <h1 
                            className="
                                font-bold 
                                leading-tight 
                                text-3xl sm:text-4xl md:text-5xl 
                                max-w-xs sm:max-w-md md:max-w-2xl 
                                wrap-break-word
                            "
                        >
                            I'm{" "}
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={currentDescription}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.6 }}
                                    className="gradient-text-animate block"
                                >
                                    {currentDescription}
                                </motion.span>
                            </AnimatePresence>
                        </h1>
                    </div>

                    <div className="
                            italic text-gray-300
                            text-lg sm:text-xl md:text-2xl
                            max-w-sm sm:max-w-lg md:max-w-2xl
                            wrap-break-word
                            mt-6
                        "
                    >
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentQuote}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                            >
                                {currentQuote}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {isDev && (
                <button
                    onClick={() => earnEmbers(100)}
                    className="fixed top-4 right-4 z-9999 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 pointer-events-auto"
                    title="Dev: +100 Embers"
                >
                    🔥 +100
                </button>
            )}
            
            <DialogueBox nodes={homeDialogue.nodes} />
        </div>
    );
}

export default Home
