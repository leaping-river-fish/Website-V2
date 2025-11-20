import type { StateRefs } from "./game_engine";

export function initPhase(phase: number, state: StateRefs) {
    switch (phase) {
        case 0: return initPhase0(state);
        case 1: return initPhase1(state);
        case 2: return initPhase2(state);
        case 3: return initPhase3(state);
        case 4: return initPhase4(state);
        default: return;
    }
}

export function initPhase0(state: StateRefs) {
    state.setHasWokenUp(false);
    state.setPhase1HoverCount(0);
    state.setIsBlackout(false);
    state.setButtonOpacity(1);

    state.setPosition({
        top: Math.floor(window.innerHeight / 2),
        left: Math.floor(window.innerWidth / 2),
    });
}

export function initPhase1(state: StateRefs) {
    state.setPhase1HoverCount(0);
    state.setIsBlackout(false);
    state.setButtonOpacity(1);
}

export function initPhase2(state: StateRefs) {
    state.setIsBlackout(true);
    state.setButtonOpacity(0.8);

    const buttonWidth = 100;
    const buttonHeight = 50;
    const padding = 20;

    const newLeft = padding + Math.random() * (window.innerWidth - buttonWidth - 2 * padding);
    const newTop = padding + Math.random() * (window.innerHeight - buttonHeight - 2 * padding);

    state.setPosition({ top: newTop, left: newLeft });

    setTimeout(() => {
        state.setIsBlackout(false);
    }, 700);

    state.setPhase2FoundCount(0);
    state.setPhase2AccusationIndex(0);

    if (state.story.phase2.intro) {
        state.startDialogue(state.story.phase2.intro);
    }
}

export function initPhase3(state: StateRefs) {
    (state as any)._phase3RecentlyCaught = false;

    state.movement.current.phase3CaughtCount = 0;
    state.movement.current.phase3LineIndex = 0;
    state.movement.current.phase3RecentlyCaught = false;

    state.movement.current.vx = Math.random() > 0.5 ? 2 : -2;
    state.movement.current.vy = Math.random() > 0.5 ? 2 : -2;
    state.movement.current.speed = 2;

    const buttonWidth = state.buttonSize.width || 100;
    const buttonHeight = state.buttonSize.height || 50;
    const padding = 50;

    const left = Math.random() * (window.innerWidth - buttonWidth - padding * 2) + padding;
    const top = Math.random() * (window.innerHeight - buttonHeight - padding * 2) + padding;
    state.setPosition({ left, top });

    if (state.motionX && state.motionY) {
        state.motionX.set(left);
        state.motionY.set(top);
    }

    state.setButtonOpacity(1);
    state.setIsBlackout(false);

    if (state.story.phase3.intro) {
        state.startDialogue(state.story.phase3.intro);
    }
}

export function initPhase4(state: StateRefs) {

    state.movement.current.vx = 0;
    state.movement.current.vy = 0;
    state.movement.current.speed = 0;

    state.movement.current.phase3CaughtCount = 0;
    state.movement.current.phase3LineIndex = 0;
    state.movement.current.phase3RecentlyCaught = false;

    if (state.motionX && state.motionY) {
        state.motionX.set(state.position.left);
        state.motionY.set(state.position.top);
    }

    state.setButtonOpacity(1);

    state.setIsBlackout(false);
}

