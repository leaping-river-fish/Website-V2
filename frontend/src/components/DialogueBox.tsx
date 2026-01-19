import { useDialogue } from '../contexts/DialogueContext';
import type { DialogueNode, DialogueChoice } from '../dialogue/dialogue-types';
import { TutorialOverlay } from './tutorial/TutorialOverlay';
import { useEffect } from 'react';

interface DialogueBoxProps {
    nodes?: Record<string, DialogueNode>;
    onContinue?: () => void;               
    onChoiceSelect?: (choice: DialogueChoice) => void;
}

export function DialogueBox({ nodes, onContinue, onChoiceSelect }: DialogueBoxProps) {
    const { 
        dialogueText, 
        isActive, 
        isTyping, 
        currentNode,
        highlightTarget,
        completeTyping,
        advanceToNode,
        hideDialogue,
        canClick
    } = useDialogue();

    // Handle click on dialogue box
    const handleClick = async () => {
        // Check cooldown first
        if (!canClick() || !currentNode) return;

        if (isTyping) {
            // Skip typewriter, show full text
            completeTyping();
            return;
        }

        // If there are choices, don't auto-advance
        if (currentNode.choices && currentNode.choices.length > 0) {
            return;
        }

        // Custom continue handler
        if (onContinue) {
            onContinue();
            return;
        }

        // Auto-advance if node has next
        if (currentNode.next && nodes) {
            advanceToNode(currentNode.next, nodes);
            return;
        }

        // If done or no next, hide dialogue
        if (currentNode.done || !currentNode.next) {
            // Call onComplete callback if it exists
            if (currentNode.onComplete) {
                await currentNode.onComplete();
            }
            hideDialogue();
        }
    };

    const handleChoiceClick = async (choice: DialogueChoice) => {
        // Check cooldown first
        if (!canClick() || !currentNode) return;

        if (onChoiceSelect) {
            // Custom choice handler
            onChoiceSelect(choice);
        } else if (choice.next && nodes) {
            // Auto-advance to next node
            advanceToNode(choice.next, nodes);
        } else {
            // No next node, hide dialogue
            // Call onComplete callback if it exists
            if (currentNode.onComplete) {
                await currentNode.onComplete();
            }
            hideDialogue();
        }
    };

    // Add global click handler for advancing dialogue
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!currentNode) return;
            
            // Don't handle if clicking on a choice button, the dialogue box itself, or the help button
            const target = e.target as HTMLElement;
            if (
                target.closest('.dialogue-box') || 
                target.closest('.dialogue-choice-button') ||
                target.closest('[data-tutorial-id="help-button"]') ||
                target.closest('.skip-dialogue-button')
            ) {
                return;
            }

            // If there are choices, don't auto-advance on global click
            if (currentNode.choices && currentNode.choices.length > 0) {
                return;
            }

            // Otherwise, handle the click like clicking on the dialogue box
            handleClick();
        };

        if (isActive && currentNode) {
            // Add a small delay to prevent the click that opened the dialogue from immediately closing it
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleGlobalClick);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('click', handleGlobalClick);
            };
        }
    }, [isActive, isTyping, currentNode, nodes]);

    // Add keyboard handler for Space and Enter keys
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!currentNode) return;
            
            // Only handle Space and Enter keys
            if (e.key !== ' ' && e.key !== 'Enter') {
                return;
            }

            // Prevent default behavior (scrolling for Space, form submission for Enter)
            e.preventDefault();

            // If there are choices, don't auto-advance on keyboard press
            if (currentNode.choices && currentNode.choices.length > 0) {
                return;
            }

            // Otherwise, handle the key press like clicking on the dialogue box
            handleClick();
        };

        if (isActive && currentNode) {
            // Add a small delay to prevent immediate key presses from closing the dialogue
            const timeoutId = setTimeout(() => {
                document.addEventListener('keydown', handleKeyPress);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, [isActive, isTyping, currentNode, nodes]);

    // Early return AFTER all hooks
    if (!isActive || !currentNode) return null;

    return (
        <>
            <TutorialOverlay targetId={highlightTarget} />

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 z-70 pointer-events-none">
                <div className="relative flex items-end justify-center">
                    {/* Dialogue Box */}
                    <div 
                        className={`dialogue-box bg-white text-black p-6 rounded-lg shadow-lg pointer-events-auto relative z-40 w-full ${!currentNode.choices && !isTyping ? 'cursor-pointer' : ''}`}
                        onClick={handleClick}
                    >
                        <div className="text-base leading-relaxed">
                            {dialogueText}
                        </div>

                        {/* Choices */}
                        {!isTyping && currentNode.choices && currentNode.choices.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2">
                                {currentNode.choices.map((choice, idx) => (
                                    <button
                                        key={idx}
                                        className="dialogue-choice-button px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-left cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleChoiceClick(choice);
                                        }}
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Continue prompt */}
                        {!isTyping && !currentNode.choices && (
                            <div className="text-gray-600 mt-3 text-sm select-none">
                                <span className="blink">▼</span> Click, Space, or Enter to continue
                            </div>
                        )}
                    </div>

                    {/* Lumie Portrait */}
                    <div 
                        className="absolute right-0 top-0 pointer-events-none z-30"
                        style={{ 
                            transform: 'translate(20%, -69%)'
                        }}
                    >
                        <img 
                            src="/images/dragons/lumie/Lumie_torso.png"
                            alt="Lumie"
                            className="w-75 h-100 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                        />
                    </div>

                    {/* Skip Dialogue Button */}
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            
                            // Mark tutorial as complete when skipping
                            try {
                                await fetch('/api/anon-profile', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'complete-tutorial' })
                                });
                            } catch (error) {
                                console.error('Failed to mark tutorial as complete:', error);
                            }
                            
                            hideDialogue();
                        }}
                        className="skip-dialogue-button absolute top-0 right-0 mt-2 mr-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors pointer-events-auto z-50"
                        title="Skip dialogue"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </>
    );
}
