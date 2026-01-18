import type { DialogueTree } from './dialogue-types';

export const achievementDialogue: DialogueTree = {
    nodes: {
        welcome: {
            text: "Welcome to the Achievements page! Do you need any help?",
            choices: [
                { text: "Yes!", next: "tour_start" },
                { text: "Nope, I got it!", next: "cancel" }
            ]
        },
        cancel: {
            text: "You must be a pro at this by now! Feel free to explore the page. I'll always be available to help you if you click the help icon in the navbar!",
            highlight: "help-button",
            done: true
        },
        tour_start: {
            text: "Ok, let me explain how the achievements page works...",
            next: "explain_achievements"
        },
        explain_achievements: {
            text: "The achievements page allows you to track your quest progress and earn ember rewards.",
            highlight: "quest-list",
            next: "explain_statistics"
        },
        explain_statistics: {
            text: "The statistics section shows you your total completed achievements, your completion percentage, and the remaining embers you can earn from achievements.",
            highlight: "statistics-section",
            next: "explain_filters"
        },
        explain_filters: {
            text: "You can filter the achievements by category to find the ones you're interested in.",
            highlight: "filter-buttons",
            next: "explain_completed"
        },
        explain_completed: {
            text: "And don't worry about checking back every minute, you'll be notified when you complete an achievement!",
            next: "explain_rewards"
        },
        explain_rewards: {
            text: "When you complete an achievement, you'll earn ember rewards. You can use these embers to purchase items in the shop.",
            highlight: "ember-counter",
            next: "explain_coming_soon"
        },
        explain_coming_soon: {
            text: "Some achievements are still in development and will be added soon! Those are marked as 'Coming Soon'.",
            highlight: "quest-list",
            next: "tour_end"
        },
        tour_end: {
            text: "That's all! Will you be able to 100% the website? Only time will tell. I'll always be available to help you if you click the help icon in the navbar!",
            highlight: "help-button",
            done: true
        }
    }
};