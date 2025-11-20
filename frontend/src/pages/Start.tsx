// TO DO: Add button reactions, user text responses
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { story } from "../components/start_game/story";
import { useDialogueEngine } from "../components/start_game/dialogue_engine";
import * as gameEngine from "../components/start_game/game_engine";
import { initPhase } from "../components/start_game/phase_inits";

export default function StartPage() {
    const navigate = useNavigate();
    const [lastClickTime, setLastClickTime] = useState(0);
    const CLICK_COOLDOWN = 500;
    const {  dialogueText, isDialogueActive, isTyping, startDialogue, advanceDialogue } = useDialogueEngine();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [buttonSize, setButtonSize] = useState({ width: 120, height: 50 });

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
    const cursorPos = useRef({ x: 0, y: 0 });
    const phaseRef = useRef(phase);
    useEffect(() => { phaseRef.current = phase; }, [phase]);

    const movement = useRef({
        vx: 0,
        vy: 0,
        speed: 2,
        phase3CaughtCount: 0,
        phase3LineIndex: 0,
        phase3RecentlyCaught: false,
    });

    const motionX = useMotionValue(position.left);
    const motionY = useMotionValue(position.top);

    const stateRefs = {
        phase,
        buttonSize,
        setPhase,
        position,
        setPosition,
        buttonOpacity,
        setButtonOpacity,
        isBlackout,
        setIsBlackout,
        hasWokenUp,
        setHasWokenUp,
        phase1HoverCount,
        setPhase1HoverCount,
        phase2FoundCount,
        setPhase2FoundCount,
        phase2AccusationIndex,
        setPhase2AccusationIndex,
        phase2Hiding,
        setPhase2Hiding,
        cursorPos,
        startDialogue,
        story,
        navigate,

        movement,
        phaseRef,
        motionX,
        motionY,
    };

    useEffect(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonSize({ width: rect.width, height: rect.height });
        }
    }, []);

    useEffect(() => {
        initPhase(phase, stateRefs);

        if (phase === 3) {
            motionX.set(stateRefs.position.left);
            motionY.set(stateRefs.position.top);
        }
    }, [phase]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            cursorPos.current.x = e.clientX;
            cursorPos.current.y = e.clientY;
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    useEffect(() => {
        let raf = 0;

        const animate = () => {
            if (phaseRef.current === 3) {
                const { width: buttonWidth, height: buttonHeight } = buttonSize;

                const curX = motionX.get();
                const curY = motionY.get();

                let newX = curX + movement.current.vx * movement.current.speed;
                let newY = curY + movement.current.vy * movement.current.speed;

                if (newX < 0) {
                    newX = 0;
                    movement.current.vx *= -1;
                } else if (newX > window.innerWidth - buttonWidth) {
                    newX = window.innerWidth - buttonWidth;
                    movement.current.vx *= -1;
                }

                if (newY < 0) {
                    newY = 0;
                    movement.current.vy *= -1;
                } else if (newY > window.innerHeight - buttonHeight) {
                    newY = window.innerHeight - buttonHeight;
                    movement.current.vy *= -1;
                }

                motionX.set(newX);
                motionY.set(newY);

                const c = cursorPos.current;
                const overlap =
                    c.x >= newX &&
                    c.x <= newX + buttonWidth &&
                    c.y >= newY &&
                    c.y <= newY + buttonHeight;

                if (overlap) {
                    gameEngine.handlePhase3Caught(stateRefs);
                }

                const now = performance.now();
                if (!(animate as any)._lastSync || now - (animate as any)._lastSync > 50) {
                    setPosition({ left: newX, top: newY });
                    (animate as any)._lastSync = now;
                }
            }

            raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

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
            case 4: gameEngine.handleClickPhase4(stateRefs); break;
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
            className="relative w-screen h-screen bg-black"
            onClick={handleGlobalClick}
        >
            {isBlackout && (
                <div className="fixed top-0 left-0 w-screen h-screen bg-black z-30"></div>
            )}

            <motion.button
                ref={buttonRef}
                animate={{
                    left: phaseRef.current === 3 ? undefined : position.left,
                    top: phaseRef.current === 3 ? undefined : position.top,
                    opacity: buttonOpacity
                }}
                style={{
                    position: "absolute",
                    x: phaseRef.current === 3 ? motionX : undefined,
                    y: phaseRef.current === 3 ? motionY : undefined,
                }}
                transition={{
                    duration: phaseRef.current === 3 ? 0 : 0.3
                }}
                className="absolute px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 z-20"
                onMouseEnter={handleHover}
                onClick={handleClick}
            >
                Start
            </motion.button>

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