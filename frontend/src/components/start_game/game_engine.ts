import type { StoryType } from "./story_type";
import { MotionValue } from "framer-motion";

export interface StateRefs {
    buttonSize: { width: number; height: number };
    phase: number;
    setPhase: (phase: number) => void;
    position: { top: number; left: number };
    setPosition: (pos: { top: number; left: number }) => void;
    buttonOpacity: number;
    setButtonOpacity: (opacity: number) => void;
    isBlackout: boolean;
    setIsBlackout: (b: boolean) => void;
    hasWokenUp: boolean;
    setHasWokenUp: (b: boolean) => void;
    phase1HoverCount: number;
    setPhase1HoverCount: (n: number) => void;
    phase2FoundCount: number;
    setPhase2FoundCount: (n: number) => void;
    phase2AccusationIndex: number;
    setPhase2AccusationIndex: (n: number) => void;
    phase2Hiding: boolean;
    setPhase2Hiding: (b: boolean) => void;
    startDialogue: (lines: string[]) => void;
    story: StoryType;
    navigate: (path: string) => void;

    cursorPos: React.RefObject<{ x: number; y: number }>;

    movement: React.RefObject<{
        vx: number;
        vy: number;
        speed: number;
        phase3CaughtCount: number;
        phase3LineIndex: number;
        phase3RecentlyCaught: boolean;
    }>;
    phaseRef: React.RefObject<number>;

    motionX: MotionValue<number>;
    motionY: MotionValue<number>;
}

const TELEPORT_PADDING = 100;

function teleportButton(state: StateRefs, cursor: { x: number; y: number }) {
    const buttonWidth = 100;
    const buttonHeight = 50;
    const padding = 20;
    let newLeft: number;
    let newTop: number;
    let tries = 0;

    do {
        newLeft = padding + Math.random() * (window.innerWidth - buttonWidth - 2 * padding);
        newTop = padding + Math.random() * (window.innerHeight - buttonHeight - 2 * padding);
        tries++;
        if (tries > 10) break;
    } while (
        Math.abs(newLeft - cursor.x) < TELEPORT_PADDING &&
        Math.abs(newTop - cursor.y) < TELEPORT_PADDING
    );

    state.setPosition({ left: newLeft, top: newTop });
    state.motionX.set(newLeft);
    state.motionY.set(newTop);
}

{/* Phase 0 */}

export function handleHoverPhase0(state: StateRefs) {
    if (!state.hasWokenUp) {
        state.startDialogue(state.story.phase0.intro);
        state.setHasWokenUp(true);
    }
}

export function handleClickPhase0(state: StateRefs) {
    if (!state.hasWokenUp) return;
    state.startDialogue(state.story.phase0.buttonFinal);
    state.setPhase(1);
}

{/* Phase 1 */}

const PHASE1_HOVER_LIMIT = 10;

export function handleHoverPhase1(state: StateRefs, e: React.MouseEvent<HTMLButtonElement>) {
    const newHoverCount = state.phase1HoverCount + 1;
    state.setPhase1HoverCount(newHoverCount);

    if (newHoverCount < PHASE1_HOVER_LIMIT) {
        const taunts = state.story.phase1.taunts;
        const taunt = taunts[Math.floor(Math.random() * taunts.length)];
        state.startDialogue([taunt]);

        teleportButton(state, state.cursorPos.current);

    } else if (newHoverCount === PHASE1_HOVER_LIMIT) {
        state.startDialogue(state.story.phase1.finale);
        setTimeout(() => {
            state.setPhase(2);  
        }, 3000);
    }
}

{/* Phase 2 */}

const PHASE2_FIND_LIMIT = 5;

export function handleHoverPhase2(state: StateRefs, e: React.MouseEvent<HTMLButtonElement>) {
    const newFoundCount = state.phase2FoundCount + 1;
    state.setPhase2FoundCount(newFoundCount);

    const accusation = state.story.phase2.foundLines[state.phase2AccusationIndex];
    state.setPhase2AccusationIndex(state.phase2AccusationIndex + 1);
    state.startDialogue([accusation]);

    state.setIsBlackout(true);

    teleportButton(state, state.cursorPos.current);

    const opacity = Math.max(0.01, 0.8 - newFoundCount * 0.2);
    state.setButtonOpacity(opacity);

    setTimeout(() => {
        state.setIsBlackout(false);
    }, 2500);

    if (newFoundCount >= PHASE2_FIND_LIMIT) {
        state.startDialogue([accusation]);
        setTimeout(() => {
            state.startDialogue(state.story.phase2.finale);
        }, 3000)
        setTimeout(() => {
            state.setPhase(3);
            state.setButtonOpacity(1);
        }, 6000);
    }
}

{/* Phase 3 */}

export function handleHoverPhase3(state: StateRefs) {
    
}

export function updatePhase3Position(state: StateRefs) {
    
}

const PHASE3_CAUGHT_LIMIT = 5;

export function handlePhase3Caught(state: StateRefs) {
    if (state.movement.current.phase3RecentlyCaught) return;

    state.movement.current.phase3RecentlyCaught = true;
    setTimeout(() => {
        state.movement.current.phase3RecentlyCaught = false;
    }, 500);

    const lines = state.story.phase3.caughtLines;
    const line = lines[state.movement.current.phase3LineIndex! % lines.length];
    state.startDialogue([line]);

    state.movement.current.phase3LineIndex! += 1;
    state.movement.current.phase3CaughtCount! += 1;

    state.movement.current.speed! += 0.5;

    if (state.movement.current.phase3CaughtCount! >= PHASE3_CAUGHT_LIMIT) {
        setTimeout(() => {
            state.startDialogue(state.story.phase3.finale);
            state.setPhase(4);
            state.setButtonOpacity(1);
        }, 500);
    }
}

{/* Phase 4 */}

export function handleClickPhase4(state: StateRefs) {
    state.navigate("/home");
}
