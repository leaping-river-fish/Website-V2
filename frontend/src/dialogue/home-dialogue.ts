import type { DialogueTree } from './dialogue-types';

export const homeDialogue: DialogueTree = {
    nodes: {
        welcome: {
            text: "Hey there! I'm Lumie, your guide around here. Want a quick tour?",
            choices: [
                { text: "Sure, show me around!", next: "tour_start" },
                { text: "Maybe later", next: "cancel" }
            ]
        },
        cancel: {
            text: "That's okay, you can find me any time by clicking the help icon in the navbar beside the ember counter!",
            highlight: "help-button",
            done: true
        },
        tour_start: {
            text: "Awesome! Let me tell you about the ember system first...",
            next: "explain_embers"
        },
        explain_embers: {
            text: "See those flickering embers in the background? You can collect them by clicking on them!",
            highlight: "flying-embers",
            next: "explain_flares"
        },
        explain_flares: { 
            text: "And sometimes, you'll see a flare. These are special embers which are 100x hotter than regular embers!",
            next: "explain_dragons"
        },
        explain_dragons: { 
            text: "In the future, you'll be able to tame dragons to help you collect embers!",
            next: "explain_quests_1"
        },
        explain_quests_1: {
            text: "You can also earn embers by completing quests.",
            next: "explain_quests_2"
        },
        explain_quests_2: {
            text: "Quests are challenges you complete by exploring and performing various actions on the site. Check your achievements page to see them all!",
            highlight: "achievements-button",
            next: "explain_shop"
        },
        explain_counter: { 
            text: "You can track your embers in the ember counter in the navbar...",
            next: "explain_quests"
        },
        explain_shop: {
            text: "By clicking the ember counter, you can enter the shop to spend embers to unlock cool flame themes and other goodies!",
            highlight: "ember-counter",
            next: "tour_end"
        },
        tour_end: {
            text: "That's the basics! Feel free to explore. I'll always be available to help you if you click the help icon in the navbar!",
            highlight: "help-button",
            done: true
        }
    }
};