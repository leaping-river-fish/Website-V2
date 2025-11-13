import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StartPage() {
    const navigate = useNavigate();

    const [position, setPosition] = useState({ top: "50%", left: "50%" });

    const [isDialogueActive, setIsDialogueActive] = useState(false);
    const [dialogueText, setDialogueText] = useState("");
    const [fullDialogue, setFullDialogue] = useState("");

    // Dialogue Triggers
    const [hasWokenUp, setHasWokenUp] = useState(false);

    const dialogues = [
        "Welcome to Nick's website!",
        "Try to click me if you dare!",
        "Ha! Missed me!",
        "Ok, maybe you’re getting closer…",
        "SIKE!"
    ];

    // Typewriter Effect
    useEffect(() => {
        if (!isDialogueActive || fullDialogue === "") return;

        setDialogueText("");

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < fullDialogue.length) {
                setDialogueText((prev) => prev + fullDialogue[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [fullDialogue, isDialogueActive]);

    // Trigger Dialogue
    const triggerDialogue = (text: string) => {
        setFullDialogue(text);
        setIsDialogueActive(true);
    };

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isDialogueActive) {
            if (!hasWokenUp) {
                triggerDialogue("What do you think you're doing?");
                setHasWokenUp(true);
            } else {
                const offsetX = Math.random() * 300 - 150;
                const offsetY = Math.random() * 300 - 150;
                setPosition({
                    top: `${Math.min(Math.max(e.clientY + offsetY, 50), window.innerHeight - 50)}px`,
                    left: `${Math.min(Math.max(e.clientX + offsetX, 50), window.innerWidth - 50)}px`,
                });
                triggerDialogue("Try to catch me!");
            }
        }
    };

    const handleClick = () => {
        if (!isDialogueActive) {
            triggerDialogue("You got me...");
            setTimeout(() => navigate("/home"), 1000);
        }
    };

    return (
        <div className="relative w-screen h-screen bg-black flex items-center justify-center">
            <button 
                style={{ top: position.top, left: position.left }}
                className="absolute px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
                onMouseEnter={handleHover}
                onClick={handleClick}
            >
                Start
            </button>

            {isDialogueActive && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 bg-white text-black p-4 rounded-lg shadow-lg z-50 cursor-pointer"
                    onClick={() => setIsDialogueActive(false)}
                >
                    {dialogueText}
                </div>
            )}
        </div>
    );
}