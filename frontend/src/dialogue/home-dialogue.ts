import type { DialogueTree } from './dialogue-types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function markTutorialComplete() {
    try {
        const response = await fetch(`${API_BASE}/anon-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete-tutorial' })
        });
        const data = await response.json();
        
        // Dispatch quest completion events
        if (data.completedQuests && data.completedQuests.length > 0) {
            window.dispatchEvent(new CustomEvent('questsCompleted', { 
                detail: { completedQuests: data.completedQuests } 
            }));
        }
    } catch (error) {
        console.error('Failed to mark tutorial as complete:', error);
    }
}

async function markTutorialSkipped() {
    try {
        const response = await fetch(`${API_BASE}/anon-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'skip-tutorial' })
        });
        const data = await response.json();
        
        // Dispatch quest completion events
        if (data.completedQuests && data.completedQuests.length > 0) {
            window.dispatchEvent(new CustomEvent('questsCompleted', { 
                detail: { completedQuests: data.completedQuests } 
            }));
        }
    } catch (error) {
        console.error('Failed to mark tutorial as skipped:', error);
    }
}

export const homeDialogue: DialogueTree = {
    nodes: {
        welcome: {
            text: "Hey there! I'm Lumie, your guide around here. Want a quick tour?",
            emotion: "happy",
            choices: [
                { text: "Sure, show me around!", next: "tour_start" },
                { text: "Maybe later (skip tutorial)", next: "cancel" }
            ]
        },
        cancel: {
            text: "That's okay, you can find me any time by clicking the help icon in the navbar beside the ember counter!",
            emotion: "neutral",
            highlight: "help-button",
            done: true,
            onComplete: markTutorialSkipped
        },
        tour_start: {
            text: "Awesome! Let me tell you about the ember system first...",
            emotion: "happy",
            next: "explain_embers"
        },
        explain_embers: {
            text: "See those flickering embers in the background? You can collect them by clicking on them!",
            emotion: "neutral",
            highlight: "flying-embers",
            next: "explain_flares"
        },
        explain_flares: { 
            text: "And sometimes, you'll see a flare. These are special embers which are 100x hotter than regular embers!",
            emotion: "greedy",
            next: "explain_dragons1"
        },
        explain_dragons1: { 
            text: "Dragons like me will also help you collect embers, you'll be able to tame more dragons to help you collect embers!",
            emotion: "happy",
            next: "explain_dragons_2"
        },
        explain_dragons_2: {
            text: "You collect the embers collected by dragons by clicking this button in the bottom right corner of the screen.",
            emotion: "neutral",
            next: "explain_quests_1",
            highlight: "collect-ember-button",
        },
        explain_quests_1: {
            text: "You can also earn embers by completing quests.",
            emotion: "greedy",
            next: "explain_quests_2"
        },
        explain_quests_2: {
            text: "Quests are challenges you complete by exploring and performing various actions on the site. Check your achievements page to see them all!",
            emotion: "happy",
            highlight: "achievements-button",
            next: "explain_shop"
        },
        explain_counter: { 
            text: "You can track your embers in the ember counter in the navbar...",
            emotion: "neutral",
            next: "explain_quests"
        },
        explain_shop: {
            text: "By clicking the ember counter, you can enter the shop to spend embers to unlock cool flame themes and other goodies!",
            emotion: "greedy",
            highlight: "ember-counter",
            next: "tour_end"
        },
        tour_end: {
            text: "That's the basics! Feel free to explore. I'll always be available to help you if you click the help icon in the navbar!",
            emotion: "happy",
            highlight: "help-button",
            done: true,
            onComplete: markTutorialComplete
        }
    }
};