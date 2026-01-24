export interface DialogueNode {
    text: string;
    next?: string | null;
    choices?: DialogueChoice[];
    done?: boolean;
    character?: string;
    emotion?: string; 
    animation?: string;  
    delay?: number;    
    highlight?: string;
    onComplete?: () => void | Promise<void>; // Callback when dialogue node completes
}

export interface DialogueChoice {
    text: string;
    next: string | null;
    animation?: string;
}

export interface DialogueTree {
    nodes: Record<string, DialogueNode>;
}