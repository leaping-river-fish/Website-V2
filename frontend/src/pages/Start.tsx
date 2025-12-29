// TO DO: make phase 2 button only appear after choice is made,
// top left corner issue(may require refactoring using motion), Add button reactions(fix phase 3 spin out)
// Game still shows up for large Ipads
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { story } from "../components/start_game/story";
import { useDialogueEngine } from "../components/start_game/dialogue_engine";
import type { DialogueNode } from "../components/start_game/story_type";
import * as gameEngine from "../components/start_game/game_engine";
import { initPhase } from "../components/start_game/phase_inits";
import { advanceNode } from "../components/start_game/game_engine";

interface StartPageProps {
    profile?: { anonId: string; introGameCompleted: boolean } | null;
}

export default function StartPage({ profile }: StartPageProps) {
    /* --------------------------- DEVELOPMENT -------------------------- */
    const isDev = import.meta.env.DEV;

    /* ----------------------- NAVIGATION & HOOKS ----------------------- */
    const navigate = useNavigate();
    const { dialogueText, isDialogueActive, isTyping, startDialogue, setIsDialogueActive, completeDialogue } = useDialogueEngine();

    /* ----------------------- BUTTON REFS & STATE ----------------------- */
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [buttonSize, setButtonSize] = useState({ width: 120, height: 50 });
    const [buttonOpacity, setButtonOpacity] = useState(1);
    const CLICK_COOLDOWN = 500;
    const [lastClickTime, setLastClickTime] = useState(0);

    /* ----------------------- PHASE STATE ----------------------- */
    const [phase, setPhase] = useState(0);
    const phaseRef = useRef(phase); // keep latest phase in ref
    useEffect(() => { phaseRef.current = phase; }, [phase]); 

    /* ----------------------- DIALOGUE / NODE STATE ----------------------- */
    const prevNodeRef = useRef<string | null>(null);
    const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
    const [currentPhaseNodes, setCurrentPhaseNodes] = useState<{ [key: string]: DialogueNode }>({});

    /* ----------------------- POSITION / MOVEMENT ----------------------- */
    const [position, setPosition] = useState<{ top: number; left: number }>({
        top: Math.floor(window.innerHeight / 2),
        left: Math.floor(window.innerWidth / 2),
    });
    const cursorPos = useRef({ x: 0, y: 0 });

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

    /* ----------------------- PHASE-SPECIFIC STATE ----------------------- */
    const [hasWokenUp, setHasWokenUp] = useState(false);
    const [phase1HoverCount, setPhase1HoverCount] = useState(0);
    const [phase2FoundCount, setPhase2FoundCount] = useState(0);
    const [phase2AccusationIndex, setPhase2AccusationIndex] = useState(0);
    const [phase2Hiding, setPhase2Hiding] = useState(false);

    /* ----------------------- GLOBAL / MISC ----------------------- */
    const [isBlackout, setIsBlackout] = useState(false);

    /* ----------------------- STATE REFS FOR ENGINE ----------------------- */
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
        currentNode,
        setCurrentNode,
        currentPhaseNodes,
        setCurrentPhaseNodes,
        isDialogueActive,
        setIsDialogueActive,
        prevNodeRef,
        advanceNode,
        movement,
        phaseRef,
        motionX,
        motionY,
    };

    /* ---------------- MOBILE CHECK ---------------- */
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        setIsDesktop(mq.matches);
    }, []);

    useEffect(() => {
        if (isDesktop === false) {
            const timer = setTimeout(() => {
                navigate("/home");
            }, 800); 

            return () => clearTimeout(timer);
        }
    }, [isDesktop, navigate]);

    /* ---------------- INITIALIZE BUTTON SIZE ---------------- */
    useEffect(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonSize({ width: rect.width, height: rect.height });
        }
    }, []);

    /* ---------------- TRACK PREVIOUS NODE ---------------- */
    useEffect(() => {
        const key = Object.entries(currentPhaseNodes).find(
            ([_k, node]) => node === currentNode
        )?.[0] || null;

        prevNodeRef.current = key;
    }, [currentNode, currentPhaseNodes]);

    /* ---------------- INITIALIZE PHASE ---------------- */
    useEffect(() => {
        const nodes = story.phase0.nodes;
        setCurrentPhaseNodes(nodes);

        if (phase === 0) {
            // Only initialize start node if profile is available
            if (!profile) return;

            prevNodeRef.current =
                profile.introGameCompleted && isDesktop
                    ? "start_returning"
                    : "start";

            setIsDialogueActive(false);
            return;
        }

        initPhase(phase, stateRefs);

        if (phase === 3) {
            motionX.set(stateRefs.position.left);
            motionY.set(stateRefs.position.top);
        }
    }, [phase, profile, isDesktop]);

    /* Track cursor position */
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            cursorPos.current.x = e.clientX;
            cursorPos.current.y = e.clientY;
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    /* Animate moving button for phase 3 */
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

    const handleHover = () => {
        const buttonEl = buttonRef.current;
        switch (phase) {
            case 0: gameEngine.handleHoverPhase0(stateRefs, buttonEl); break;
            case 1: gameEngine.handleHoverPhase1(stateRefs, buttonEl); break;
            case 2: gameEngine.handleHoverPhase2(stateRefs, buttonEl); break;
            case 3: gameEngine.handlePhase3Caught(stateRefs, buttonEl); break;
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

        console.log(
            "%cCLICK",
            "background: #222; color: #bada55; font-size: 14px; padding: 2px 6px;",
            {
                phase,
                isDialogueActive,
                isTyping,
                currentNode,
                prevNodeRef: prevNodeRef.current,
                blackout: isBlackout
            }
        );


        if (isDialogueActive && isTyping) {
            completeDialogue();
            return;
        }

        if (isDialogueActive && !isTyping) {
            if (currentNode?.choices?.length) return;

            if (currentNode?.next) {
                const nextNode = currentPhaseNodes[currentNode.next];
                if (nextNode) {
                    advanceNode(stateRefs, currentNode.next!, buttonRef.current);
                    return;
                }
            }

            if (currentNode?.done) {
                setIsDialogueActive(false);
                setCurrentNode(null);
                setPhase(prev => prev + 1);
                return;
            }

            setIsDialogueActive(false);
            setCurrentNode(null);
            return;
        }

        if (isBlackout && phase !== 2) {
            setIsBlackout(false);
        }
    };

    if (isDesktop === false) {
        return (
            <div className="w-screen h-screen bg-black flex items-center justify-center text-white px-6 text-center">
                <p className="text-sm sm:text-base max-w-md leading-relaxed">
                    Some interactive features are best experienced on desktop.
                    <br />
                    Taking you inside…
                </p>
            </div>
        );
    }

    return (
        <div 
            className="relative w-screen h-screen bg-black"
            onClick={handleGlobalClick}
        >
            {/* Only available in development */}
            {isDev && (
                <button
                    onClick={() => navigate("/home")}
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        padding: "8px 14px",
                        background: "red",
                        color: "white",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Skip Game
                </button>
            )}

            {isBlackout && (
                <div className="fixed top-0 left-0 w-screen h-screen bg-black z-30"></div>
            )}

            <motion.button
                ref={buttonRef}
                // initial={false}
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

            {isDialogueActive && currentNode && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 bg-white text-black p-4 rounded-lg shadow-lg z-40">
                    <div>{dialogueText}</div>

                    {!isTyping && currentNode.choices && (
                        <div className="mt-4 flex flex-col gap-2">
                            {currentNode.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={() => {
                                        if (choice.next === "__SKIP__") {
                                            setIsDialogueActive(false);
                                            setCurrentNode(null);
                                            navigate("/home");
                                            return;
                                        }
                                        if (choice.next) {
                                            advanceNode(stateRefs, choice.next, buttonRef.current, choice.animation);
                                        } else if (currentNode.done) {
                                            setIsDialogueActive(false);
                                            setCurrentNode(null);
                                            setPhase(prev => prev + 1);
                                        } else {
                                            setIsDialogueActive(false);
                                            setCurrentNode(null);
                                        }  
                                    }}
                                >
                                    {choice.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {!isTyping && !currentNode.choices && (
                        <div className="text-gray-600 mt-3 text-sm blink select-none">
                            Click anywhere to continue
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}