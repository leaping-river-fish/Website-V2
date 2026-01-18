import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DialogueNode, DialogueChoice } from '../dialogue/dialogue-types';

interface DialogueContextValue {
    // State
    dialogueText: string;
    isActive: boolean;
    isTyping: boolean;
    currentNode: DialogueNode | null;

    // Methods
    showDialogue: (node: DialogueNode) => void;
    advanceToNode: (nodeKey: string, nodes: Record<string, DialogueNode>) => void;
    hideDialogue: () => void;
    completeTyping: () => void;
    canClick: () => boolean; // Check if click cooldown has passed

    // Choice Handlers
    onChoiceSelect?: (choice: DialogueChoice, nodes: Record<string, DialogueNode>) => void;
    setOnChoiceSelect: (callback: (choice: DialogueChoice, nodes: Record<string, DialogueNode>) => void) => void;

    // Tutorial Registration
    tutorialNodes: Record<string, DialogueNode> | null;
    registerTutorial: (nodes: Record<string, DialogueNode>) => void;
    unregisterTutorial: () => void;
}

const DialogueContext = createContext<DialogueContextValue | null>(null);

export function DialogueProvider({ children }: { children: ReactNode }) {
    const [dialogueText, setDialogueText] = useState("");
    const [fullDialogue, setFullDialogue] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
    const [onChoiceSelect, setOnChoiceSelect] = useState<
        ((choice: DialogueChoice, nodes: Record<string, DialogueNode>) => void) | undefined
    >(undefined);
    const [tutorialNodes, setTutorialNodes] = useState<Record<string, DialogueNode> | null>(null);

    const timerRef = useRef<number | null>(null);
    const delayTimerRef = useRef<number | null>(null);
    const lastClickTimeRef = useRef<number>(0);
    
    const CLICK_COOLDOWN = 500;

    // Clear typewriter timer
    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Clear delay timer
    const clearDelayTimer = useCallback(() => {
        if (delayTimerRef.current !== null) {
            window.clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
        }
    }, []);

    // Typewriter effect (40ms per character, like dialogue_engine.ts)
    const startTypewriter = useCallback((text: string, speed = 40) => {
        clearTimer();
        setIsTyping(true);
        setDialogueText("");
        setFullDialogue(text);

        let i = 0;
        const localText = String(text);

        timerRef.current = window.setInterval(() => {
            const nextChar = localText.charAt(i);
            if (nextChar === "") {
                clearTimer();
                setIsTyping(false);
                return;
            }
            setDialogueText((prev) => prev + nextChar);
            i++;
        }, speed);
    }, [clearTimer]);

    // Show dialogue with optional delay
    const showDialogue = useCallback((node: DialogueNode) => {
        setCurrentNode(node);
        setIsActive(true);

        if (node.delay && node.delay > 0) {
            // Wait for delay before starting typewriter
            clearDelayTimer();
            delayTimerRef.current = window.setTimeout(() => {
                startTypewriter(node.text);
            }, node.delay);
        } else {
            // Start immediately
            startTypewriter(node.text);
        }
    }, [startTypewriter, clearDelayTimer]);

    // Advance to a specific node by key
    const advanceToNode = useCallback((nodeKey: string, nodes: Record<string, DialogueNode>) => {
        const nextNode = nodes[nodeKey];
        if (nextNode) {
            showDialogue(nextNode);
        }
    }, [showDialogue]);

    // Hide dialogue completely
    const hideDialogue = useCallback(() => {
        clearTimer();
        clearDelayTimer();
        setIsActive(false);
        setDialogueText("");
        setFullDialogue("");
        setCurrentNode(null);
        setIsTyping(false);
    }, [clearTimer, clearDelayTimer]);

    // Complete typing instantly (show full text)
    const completeTyping = useCallback(() => {
        if (isTyping) {
            clearTimer();
            setDialogueText(fullDialogue);
            setIsTyping(false);
        }
    }, [isTyping, fullDialogue, clearTimer]);

    // Check if enough time has passed since last click
    const canClick = useCallback(() => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < CLICK_COOLDOWN) {
            return false;
        }
        lastClickTimeRef.current = now;
        return true;
    }, [CLICK_COOLDOWN]);

    // Register tutorial nodes
    const registerTutorial = useCallback((nodes: Record<string, DialogueNode>) => {
        setTutorialNodes(nodes);
    }, []);
    
    // Unregister tutorial nodes
    const unregisterTutorial = useCallback(() => {
        setTutorialNodes(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimer();
            clearDelayTimer();
        };
    }, [clearTimer, clearDelayTimer]);

    return (
        <DialogueContext.Provider 
            value={{ 
                dialogueText,
                isActive,
                isTyping,
                currentNode,
                showDialogue,
                advanceToNode,
                hideDialogue,
                completeTyping,
                canClick,
                onChoiceSelect,
                setOnChoiceSelect: (callback) => setOnChoiceSelect(() => callback),
                tutorialNodes,
                registerTutorial,
                unregisterTutorial
            }}
        >
            {children}
        </DialogueContext.Provider>
    );
}

export function useDialogue() {
    const ctx = useContext(DialogueContext);
    if (!ctx) throw new Error("useDialogue must be used within DialogueProvider");
    return ctx;
}
