import { useState, useRef, useEffect } from "react";

export interface DialogueEngineProps {
    onPhaseComplete?: (phase: string) => void;
}

export function useDialogueEngine() {
    const [isDialogueActive, setIsDialogueActive] = useState(false);
    const [dialogueText, setDialogueText] = useState("");
    const [fullDialogue, setFullDialogue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [dialogueQueue, setDialogueQueue] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTypewriter = (text: string, speed = 40) => {
        clearTimer();
        setIsTyping(true);
        setDialogueText("");
        setFullDialogue(text);
        setIsDialogueActive(true);

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
    };

    const startDialogue = (lines: string[]) => {
        setIsDialogueActive(true);
        if (!lines || lines.length === 0) return;
        setDialogueQueue(lines);
        setCurrentIndex(0);
        startTypewriter(lines[0]);
    };

    const completeDialogue = () => {
        if (!isDialogueActive) return;

        if (isTyping) {
            clearTimer();
            setDialogueText(fullDialogue);
            setIsTyping(false);
        }
    };

    useEffect(() => {
        return () => clearTimer();
    }, []);

    return {
        dialogueText,
        isDialogueActive,
        setIsDialogueActive,
        isTyping,
        startDialogue,
        completeDialogue
    };
}