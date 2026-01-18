export interface DialogueNode {
    text: string;
    next?: string | null;
    choices?: DialogueChoice[];
    done?: boolean;
    character?: string; // Default "lumie", but could support other characters
    emotion?: string;   // Could change Lumie's expression
    animation?: string;  
    delay?: number;    
    highlight?: string;
}

export interface DialogueChoice {
    text: string;
    next: string | null;
    animation?: string;
}

export interface DialogueTree {
    nodes: Record<string, DialogueNode>;
}