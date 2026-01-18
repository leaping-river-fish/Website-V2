import { useDialogue } from '../contexts/DialogueContext';
import type { DialogueNode, DialogueChoice } from '../dialogue/dialogue-types';
import { TutorialOverlay } from './tutorial/TutorialOverlay';

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

    if (!isActive || !currentNode) return null;

    // Handle click on dialogue box
    const handleClick = () => {
        // Check cooldown first
        if (!canClick()) return;

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
            hideDialogue();
        }
    };

    const handleChoiceClick = (choice: DialogueChoice) => {
        // Check cooldown first
        if (!canClick()) return;

        if (onChoiceSelect) {
            // Custom choice handler
            onChoiceSelect(choice);
        } else if (choice.next && nodes) {
            // Auto-advance to next node
            advanceToNode(choice.next, nodes);
        } else {
            // No next node, hide dialogue
            hideDialogue();
        }
    };

    return (
        <>
            <TutorialOverlay targetId={highlightTarget} />

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 lg:w-1/2 z-70 pointer-events-none">
                <div className="relative flex items-end justify-center">
                    {/* Dialogue Box */}
                    <div 
                        className={`bg-white text-black p-6 rounded-lg shadow-lg pointer-events-auto relative z-40 w-full ${!currentNode.choices && !isTyping ? 'cursor-pointer' : ''}`}
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
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-left cursor-pointer"
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
                                <span className="blink">▼</span> Click to continue
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
                </div>
            </div>
        </>
    );
}
