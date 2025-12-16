import type { StoryType, DialogueNode } from "./story_type";
import { MotionValue } from "framer-motion";
import { triggerNodeAnimation } from "./animation";
import type { AnimationName } from "./animation";

export interface StateRefs {
    /* ----------------------- BUTTON STATE ----------------------- */
    buttonSize: { width: number; height: number };
    setButtonOpacity: (opacity: number) => void;
    buttonOpacity: number;

    /* ----------------------- PHASE STATE ----------------------- */
    phase: number;
    setPhase: React.Dispatch<React.SetStateAction<number>>;
    phaseRef: React.RefObject<number>;

    /* ----------------------- POSITION & MOVEMENT ----------------------- */
    position: { top: number; left: number };
    setPosition: (pos: { top: number; left: number }) => void;
    cursorPos: React.RefObject<{ x: number; y: number }>;

    movement: React.RefObject<{
        vx: number;
        vy: number;
        speed: number;
        phase3CaughtCount: number;
        phase3LineIndex: number;
        phase3RecentlyCaught: boolean;
    }>;

    motionX: MotionValue<number>;
    motionY: MotionValue<number>;

    /* ----------------------- GLOBAL STATE ----------------------- */
    isBlackout: boolean;
    setIsBlackout: (b: boolean) => void;

    /* ----------------------- PHASE-SPECIFIC STATE ----------------------- */
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

    /* ----------------------- DIALOGUE / STORY ----------------------- */
    isDialogueActive: boolean;
    setIsDialogueActive: (b: boolean) => void;
    prevNodeRef: React.RefObject<string | null>;
    currentNode: DialogueNode | null;
    setCurrentNode: (node: DialogueNode | null) => void;
    currentPhaseNodes: { [key: string]: DialogueNode };
    setCurrentPhaseNodes: (nodes: { [key: string]: DialogueNode }) => void;

    startDialogue: (lines: string[]) => void;
    advanceNode: (state: StateRefs, nextKey: string) => void;
    story: StoryType;

    /* ----------------------- NAVIGATION ----------------------- */
    navigate: (path: string) => void;
}

const TELEPORT_PADDING = 100;

export function teleportButton(state: StateRefs, cursor: { x: number; y: number }) {
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

function blackoutAndTeleport(state: StateRefs, count: number) {
    state.setIsBlackout(true);
    teleportButton(state, state.cursorPos.current);

    const opacity = Math.max(0.01, 0.8 - count * 0.2);
    state.setButtonOpacity(opacity);

    setTimeout(() => state.setIsBlackout(false), 2500);
}

export function advanceNode(
    state: StateRefs,
    nextKey: string,
    buttonEl?: HTMLElement | null,
    animationOverride?: AnimationName
) {
    const nextNode = state.currentPhaseNodes?.[nextKey];
    if (!nextNode) return null;

    state.setCurrentNode(nextNode);
    if (state.prevNodeRef) state.prevNodeRef.current = nextKey;

    if (nextNode.text && nextNode.text.length > 0) {
        state.startDialogue([nextNode.text]);
        state.setIsDialogueActive(true);
    }

    const animationToPlay = animationOverride ?? nextNode.animation;
    if (animationToPlay && buttonEl) {
        triggerNodeAnimation({ animation: animationToPlay }, buttonEl);
    }

    return nextNode;
}

export function completePhase(state: StateRefs) {
    const nextPhase = state.phase + 1;
    state.setPhase(nextPhase);
}

{/* Phase 0 */}

export function handleHoverPhase0(state: StateRefs, buttonEl?: HTMLElement | null) {
    const startNodeKey = "start";
    const startNode = state.currentPhaseNodes[startNodeKey];
    if (!startNode) return;

    if (!state.hasWokenUp) {
        state.setHasWokenUp(true);
        advanceNode(state, startNodeKey, buttonEl);
    }
}

export function handleClickPhase0(state: StateRefs) {
    if (!state.hasWokenUp) return;

    if (state.isDialogueActive) return;

    const node = state.currentNode;

    if (node?.done) {
        return;
    }

    if (node?.next) {
        advanceNode(state, node.next);
    }
}


{/* Phase 1 */}

const PHASE1_HOVER_LIMIT = 8;
export function handleHoverPhase1(state: StateRefs, _buttonEl?: HTMLElement | null) {
    if (state.isDialogueActive) return;

    const newHoverCount = state.phase1HoverCount + 1;
    state.setPhase1HoverCount(newHoverCount);

    if (newHoverCount < PHASE1_HOVER_LIMIT) {
        const tauntKeys = Object.keys(state.story.phase1.nodes).filter(k => k.startsWith("taunt"));
        const randomKey = tauntKeys[Math.floor(Math.random() * tauntKeys.length)];

        advanceNode(state, randomKey);
        teleportButton(state, state.cursorPos.current);
        return;
    } 

    if (newHoverCount === PHASE1_HOVER_LIMIT) {
        advanceNode(state, "finale");
    }
}

{/* Phase 2 */}

const PHASE2_FIND_LIMIT = 5;

export function handleHoverPhase2(state: StateRefs, buttonEl?: HTMLElement | null) {
    if (state.isDialogueActive) return;  

    const newFoundCount = state.phase2FoundCount + 1;
    state.setPhase2FoundCount(newFoundCount);

    const nodeOrder = ["found1", "found2", "found3", "found4", "found5"];
    const nextKey = nodeOrder[newFoundCount - 1];

    if (!nextKey) return;

    const node = advanceNode(state, nextKey, buttonEl);
    if (!node) return;

    if (node.choices?.length) {
        blackoutAndTeleport(state, newFoundCount);
        return;
    }

    // if (node.next) {
    //     advanceNode(state, node.next);
    // }

    blackoutAndTeleport(state, newFoundCount);

    if (newFoundCount === PHASE2_FIND_LIMIT) {
        state.setButtonOpacity(1);
    }
}

{/* Phase 3 */}

export function handleHoverPhase3(_state: StateRefs) {
    
}

export function updatePhase3Position(_state: StateRefs) {
    
}

export function handlePhase3Caught(state: StateRefs, buttonEl?: HTMLElement | null) {  
    if (state.phase !== 3) return; 

    if (!state.currentPhaseNodes) return;
    const movement = state.movement.current;

    if (movement.phase3RecentlyCaught) return;
    movement.phase3RecentlyCaught = true;
    setTimeout(() => { movement.phase3RecentlyCaught = false; }, 500);

    movement.phase3CaughtCount += 1;
    const newCount = movement.phase3CaughtCount;

    const nodeOrder = ["caught1", "caught2", "caught3", "caught4", "caught5"];
    const nextKey = nodeOrder[newCount - 1];
    if (!nextKey) return;

    const node = advanceNode(state, nextKey, buttonEl);
    if (!node) return;

    movement.speed += 1;

    if (newCount === nodeOrder.length) {
        const centerX = window.innerWidth / 2 - 50;
        const centerY = window.innerHeight / 2 - 25;
        state.setPosition({ left: centerX, top: centerY });
        state.motionX.set(centerX);
        state.motionY.set(centerY);

        state.movement.current.vx = 0;
        state.movement.current.vy = 0;
        state.movement.current.speed = 0;

        const buttonEl = document.querySelector("button");
        if (buttonEl) {
            buttonEl.classList.add("anim-spin-out");

            setTimeout(() => buttonEl.classList.remove("anim-spin-out"), 1000);
        }

        return;
    }
}

{/* Phase 4 */}

export function handleClickPhase4(state: StateRefs) {
    state.navigate("/home");
}
