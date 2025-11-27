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
    choices?: { text: string; next: string | null }[];
    next?: string | null;
    done?: boolean;
}