// TO DO: make teleport consistent for both phase 1 and 2, fix phase 3
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { story } from "../components/start_game/story";
import { useDialogueEngine } from "../components/start_game/dialogue_engine";
import * as gameEngine from "../components/start_game/game_engine";
import { initPhase } from "../components/start_game/phase_inits";

export default function StartPage() {
    const navigate = useNavigate();
    const [lastClickTime, setLastClickTime] = useState(0);
    const CLICK_COOLDOWN = 500;
    const {  dialogueText, isDialogueActive, isTyping, startDialogue, advanceDialogue } = useDialogueEngine();

    const [phase, setPhase] = useState(0);
    const [position, setPosition] = useState<{ top: number; left: number }>({
        top: Math.floor(window.innerHeight / 2),
        left: Math.floor(window.innerWidth / 2),
    });
    const [buttonOpacity, setButtonOpacity] = useState(1);
    const [isBlackout, setIsBlackout] = useState(false);

    {/* Phase Specific */}
    const [hasWokenUp, setHasWokenUp] = useState(false);
    const [phase1HoverCount, setPhase1HoverCount] = useState(0);
    const [phase2FoundCount, setPhase2FoundCount] = useState(0);
    const [phase2AccusationIndex, setPhase2AccusationIndex] = useState(0);
    const [phase2Hiding, setPhase2Hiding] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    const stateRefs = {
        phase, setPhase,
        position, setPosition,
        buttonOpacity, setButtonOpacity,
        isBlackout, setIsBlackout,
        hasWokenUp, setHasWokenUp,
        phase1HoverCount, setPhase1HoverCount,
        phase2FoundCount, setPhase2FoundCount,
        phase2AccusationIndex, setPhase2AccusationIndex,
        phase2Hiding, setPhase2Hiding,
        speed: 2,
        vx: undefined,
        vy: undefined,
        phase3CaughtCount: 0,
        phase3LineIndex: 0,
        cursorPos, 
        startDialogue,
        story,
        navigate
    };

    useEffect(() => {
        initPhase(phase, stateRefs);
    }, [phase]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (phase === 3) {
                gameEngine.updatePhase3Position(stateRefs);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [phase]);

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        switch (phase) {
            case 0: gameEngine.handleHoverPhase0(stateRefs); break;
            case 1: gameEngine.handleHoverPhase1(stateRefs, e); break;
            case 2: gameEngine.handleHoverPhase2(stateRefs, e); break;
            case 3: gameEngine.handleHoverPhase3(stateRefs); break;
        }
    };

    const handleClick = () => {
        switch (phase) {
            case 0: gameEngine.handleClickPhase0(stateRefs); break;
            case 3: gameEngine.handleClickPhase3(stateRefs); break;
        }
    };

    const handleGlobalClick = () => {
        const now = Date.now();
        if (now - lastClickTime < CLICK_COOLDOWN) return;

        setLastClickTime(now);

        advanceDialogue();

        if (isBlackout && phase !== 2) {
            setIsBlackout(false);
        }
    };

    return (
        <div 
            className="relative w-screen h-screen bg-black flex items-center justify-center"
            onClick={handleGlobalClick}
        >
            {isBlackout && (
                <div className="fixed top-0 left-0 w-screen h-screen bg-black z-30"></div>
            )}
            <button 
                style={{ 
                    top: position.top + "px", 
                    left: position.left + "px", 
                    opacity: buttonOpacity, 
                    transition: "all 0.3s ease", 
                }}
                className="absolute px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 z-20"
                onMouseEnter={handleHover}
                onClick={handleClick}
            >
                Start
            </button>

            {isDialogueActive && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 bg-white text-black p-4 rounded-lg shadow-lg z-40 cursor-pointer">
                    <div>{dialogueText}</div>
                    {!isTyping && (
                        <div className="text-gray-600 mt-3 text-sm blink select-none">
                            Click anywhere to continue
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}