import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";

function Home() {
    // Quote and Description Logic -------------------------------------------------------------------------------------------
    const descriptions = [
        "Nick Zheng",
        "a student at the University of Waterloo",
        "a Systems Design Engineer",
        "a Passionate Gamer",
        "a Dragon Enthusiast",
        "a Lifelong learner"
    ];

    const quotes = [
        "'Train like you've never won, play like you've never lost'",
        "'If we keep holding onto yesterday, what will we be tomorrow?'",
        "'Even the best would fail if they kept doing the same thing'",
        "'The only difference between courage and fear is the direction that you run'",
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
        <div className='bg-[#1A1410] min-h-screen overflow-hidden w-screen flex items-start justify-start'>
            <div className='flex flex-col items-start justify-start w-full h-[70%] mt-[5%] px-16'>
                <div className='pt-[140px] text-white space-y-6'>
                    <p className=''>Hello,</p>

                    <h1 className="text-4xl font-bold leading-tight whitespace-nowrap">
                        I'm{" "}
                        <AnimatePresence mode='wait'>
                            <motion.span
                                key={currentDescription}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6 }}
                                className="gradient-text-animate"
                            >
                                {currentDescription}
                            </motion.span>
                        </AnimatePresence>
                    </h1>

                    <div className='text-2xl italic text-gray-300 max-w-2xl'>
                        <AnimatePresence mode='wait'>
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
        </div>
    );
}

export default Home
