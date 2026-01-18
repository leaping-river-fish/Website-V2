import type { DialogueTree } from './dialogue-types';

export const shopDialogue: DialogueTree = {
    nodes: {
        welcome: {
            text: "Welcome to the Ember Shop! Do you need help?",
            choices: [
                { text: "Yes, please!", next: "tour_start" },
                { text: "No, thanks", next: "cancel" }
            ]
        },
        cancel: {
            text: "Take you time! I'll always be available to help you if you click the help icon in the navbar!",
            done: true
        },
        tour_start: {
            text: "Alright, let me explain how the shop works...",
            next: "explain_shop_1"
        },
        explain_shop_1: {
            text: "You can spend your hard-earned embers to unlock cool flame themes, tame dragons, and more!",
            next: "explain_shop_2"
        },
        explain_shop_2: {
            text: "This is also where you can equip or change your cosmetics.",
            next: "explain_flame_themes"
        },
        explain_flame_themes: {
            text: "The Flame Themes section allows you to change the color of your embers and flame effects.",
            next: "explain_dragons"
        },
        explain_dragons: {
            text: "The Dragons section allows you to tame dragons to help you collect embers. You can upgrade these dragons to make them stronger and more efficient.",
            next: "explain_coming_soon"
        },
        explain_coming_soon: { 
            text: "Some items are still in development and will be added soon! Those are marked as 'Coming Soon'.",
            next: "tour_end"
        },
        tour_end: {
            text: "That's it! Feel free to explore the shop. I'll always be available to help you if you click the help icon in the navbar!",
            done: true
        }
    }
};