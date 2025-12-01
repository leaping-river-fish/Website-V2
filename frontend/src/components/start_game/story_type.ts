import type { AnimationName } from "./animation";

export interface StoryType {
    phase0: {
        nodes: Record<string, DialogueNode>;
    };
    phase1: {
        nodes: Record<string, DialogueNode>;
    };
    phase2: {
        nodes: Record<string, DialogueNode>;
    };
    phase3: {
        nodes: Record<string, DialogueNode>;
    };
    phase4: { 
        nodes: Record<string, DialogueNode>;
    };
}

export interface DialogueNode {
    text: string;
    choices?: DialogueChoice[];
    next?: string | null;
    done?: boolean;
    animation?: AnimationName;
}

export interface DialogueChoice {
    text: string;
    next: string | null;
    animation?: AnimationName;
}