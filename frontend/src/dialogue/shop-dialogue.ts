import type { DialogueTree } from './dialogue-types';

export const shopDialogue: DialogueTree = {
    nodes: {
        welcome: {
            text: "Welcome to the Ember Shop! Do you need help?",
            emotion: "happy",
            choices: [
                { text: "Yes, please!", next: "tour_start" },
                { text: "No, thanks (skip tutorial)", next: "cancel" }
            ]
        },
        cancel: {
            text: "Take you time! I'll always be available to help you if you click the help icon in the navbar!",
            emotion: "neutral",
            highlight: "help-button",
            done: true
        },
        tour_start: {
            text: "Alright, let me explain how the shop works...",
            emotion: "neutral",
            next: "explain_shop_1"
        },
        explain_shop_1: {
            text: "You can spend your hard-earned embers to unlock cool flame themes, tame dragons, and more!",
            emotion: "greedy",
            highlight: "ember-counter",
            next: "explain_shop_2"
        },
        explain_shop_2: {
            text: "This is also where you can equip or change your cosmetics.",
            emotion: "neutral",
            next: "explain_flame_themes"
        },
        explain_flame_themes: {
            text: "The Flame Themes section allows you to change the color of your embers and flame effects.",
            emotion: "happy",
            highlight: "flame-themes-section",
            next: "explain_dragons"
        },
        explain_dragons: {
            text: "The Dragons section allows you to tame dragons to help you collect embers. You can upgrade these dragons to make them stronger and more efficient.",
            emotion: "greedy",
            highlight: "dragons-section",
            next: "explain_coming_soon"
        },
        explain_coming_soon: { 
            text: "Some items are still in development and will be added soon! Those are marked as 'Coming Soon'.",
            emotion: "neutral",
            highlight: "cursors-section",
            next: "tour_end"
        },
        tour_end: {
            text: "That's it! Feel free to explore the shop. I'll always be available to help you if you click the help icon in the navbar!",
            emotion: "happy",
            highlight: "help-button",
            done: true
        }
    }
};