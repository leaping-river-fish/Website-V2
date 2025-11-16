import type { StoryType } from "./story_type";

export interface StateRefs {
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
    phase3CaughtCount?: number;
    speed?: number;
    vx?: number;
    vy?: number;
    phase3LineIndex?: number;

    cursorPos: { x: number; y: number };
}

function teleportButton(setPosition: (pos: { top: number; left: number }) => void) {
    const buttonWidth = 100;
    const buttonHeight = 50;
    const newLeft = Math.random() * (window.innerWidth - buttonWidth);
    const newTop = Math.random() * (window.innerHeight - buttonHeight);
    setPosition({ left: newLeft, top: newTop });
}

const PHASE1_HOVER_LIMIT = 10;

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

export function handleHoverPhase1(state: StateRefs, e: React.MouseEvent<HTMLButtonElement>) {
    const newHoverCount = state.phase1HoverCount + 1;
    state.setPhase1HoverCount(newHoverCount);

    if (newHoverCount < PHASE1_HOVER_LIMIT) {
        const taunts = state.story.phase1.taunts;
        const taunt = taunts[Math.floor(Math.random() * taunts.length)];
        state.startDialogue([taunt]);

        const button = e.currentTarget;
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;
        const padding = 20;
        const maxX = window.innerWidth - buttonWidth - padding;
        const maxY = window.innerHeight - buttonHeight - padding;

        const newLeft = padding + Math.random() * maxX;
        const newTop = padding + Math.random() * maxY;
        state.setPosition({ left: newLeft, top: newTop });
    } else if (newHoverCount === PHASE1_HOVER_LIMIT) {
        state.startDialogue(state.story.phase1.finale);
        setTimeout(() => {
            state.setPhase(2);  
        }, 3000);
    }
}

{/* Phase 2 */}

const PHASE2_FIND_LIMIT = 5;
const TELEPORT_PADDING = 100;

function teleportButtonAwayFromCursor(
    setPosition: (pos: { top: number; left: number }) => void,
    cursor: { x: number; y: number }
) {
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

    setPosition({ left: newLeft, top: newTop });
}

export function handleHoverPhase2(state: StateRefs, e: React.MouseEvent<HTMLButtonElement>) {
    const newFoundCount = state.phase2FoundCount + 1;
    state.setPhase2FoundCount(newFoundCount);

    const accusation = state.story.phase2.foundLines[state.phase2AccusationIndex];
    state.setPhase2AccusationIndex(state.phase2AccusationIndex + 1);
    state.startDialogue([accusation]);

    state.setIsBlackout(true);

    teleportButtonAwayFromCursor(state.setPosition, state.cursorPos);

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
    state.vx = state.vx ?? (Math.random() > 0.5 ? 2 : -2);
    state.vy = state.vy ?? (Math.random() > 0.5 ? 2 : -2);
    state.speed = state.speed ?? 2;
    state.phase3CaughtCount = state.phase3CaughtCount ?? 0;
    state.phase3LineIndex = state.phase3LineIndex ?? 0;

    const lines = state.story.phase3.caughtLines;
    const line = lines[state.phase3LineIndex % lines.length];
    state.startDialogue([line]);
    state.phase3LineIndex! += 1;

    state.speed! += 0.5;

    state.phase3CaughtCount! += 1;

    teleportButton(state.setPosition);

    if (state.phase3CaughtCount! >= 5) {
        setTimeout(() => {
            state.startDialogue(state.story.phase3.finale);
            state.setPhase(4); 
            state.setButtonOpacity(1);
        }, 1000);
    }
}

export function updatePhase3Position(state: StateRefs) {
    if (state.phase !== 3) return;

    const buttonWidth = 100;
    const buttonHeight = 50;

    let left = state.position.left;
    let top = state.position.top;


    left += (state.vx ?? 2) * (state.speed ?? 2);
    top += (state.vy ?? 2) * (state.speed ?? 2);

    if (left <= 0 || left >= window.innerWidth - buttonWidth) state.vx! *= -1;
    if (top <= 0 || top >= window.innerHeight - buttonHeight) state.vy! *= -1;

    state.setPosition({ left, top });
}

export function handleClickPhase3(state: StateRefs) {
    state.navigate("/home");
}
