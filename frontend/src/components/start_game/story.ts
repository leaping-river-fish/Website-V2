import type { StoryType } from "./story_type";

export const story: StoryType = {
    phase0: {
        nodes: {
            start_returning: {
                text: "AAAAH!",
                next: "return",
                animation: "scared-jump"
            },
            return: {
                text: "Oh it's you again... what do you want?",
                choices: [
                    { text: "Just let me through. (skips intro game)", next: "__SKIP__" },
                    { text: "I'm challenging you again!", next: "finale" }
                ],
            },
            start: {
                text: "Woah, what do you think you're doing?",
                choices: [
                    { text: "Who are you?", next: "lumieResponse1" },
                    { text: "I just want to enter the website...", next: "lumieResponse2" }
                ],
                animation: "shake-x"
            },

            lumieResponse1: {
                text: "I'm Lumie! I'm the guardian of this website. You'll have to prove yourself to me before you can enter!",
                next: "argue",
                animation: "frustrated-wobble"
            },

            lumieResponse2: {
                text: "Not so fast! Every visitor needs to pass through me, Lumie, first!",
                next: "argue",
                animation: "frustrated-wobble"
            },

            argue: {
                text: "Think you can keep up with me?",
                choices: [
                    { text: "Absolutely! Let's do this!", next: "finale" },
                    { text: "How hard could it be?", next: "finale", animation: "shake-y" }
                ],
            },

            finale: {
                text: "Alright then! Let's see if you can catch me!",
                choices: [
                    { text: "Bring it!", next: null }
                ],
                done: true
            }
        }
    },

    phase1: {
        nodes: {
            intro: {
                text: "Let's see if you can keep up. Try to click me!",
                next: null
            },
            finale: {
                text: "Ok, you're getting pretty good at this.",
                next: null,
                done: true
            },
            taunt1: { text: "Missed me!", next: null },
            taunt2: { text: "Too slow!", next: null },
            taunt3: { text: "Try harder!", next: null },
            taunt4: { text: "Is that all you've got?", next: null },
            taunt5: { text: "A toddler could click faster!", next: null },
            taunt6: { text: "My grandma moves quicker!", next: null },
            taunt7: { text: "Are you even trying?", next: null },
            taunt8: { text: "Ha! Try harder!", next: null },
            taunt9: { text: "You’ll need lightning reflexes for this!", next: null },
            taunt10:{ text: "Keep chasing… I dare you!", next: null },
            taunt11:{ text: "Oops, too slow!", next: null },
            taunt12:{ text: "Pathetic! I expected better!", next: null },
            taunt13:{ text: "You’re making this way too easy for me!", next: null },
            taunt14:{ text: "Think you can catch me? Hah!", next: null },
            taunt15:{ text: "You’ll need more than luck!", next: null },
            taunt16:{ text: "Not even close!", next: null },
            taunt17:{ text: "Try again, human!", next: null },
            taunt18:{ text: "I’m just getting started!", next: null },
            taunt19:{ text: "Is that all your skill?", next: null },
            taunt20:{ text: "You can’t handle this speed!", next: null }
        },
    },

    phase2: {
        nodes: {
            intro: {
                text: "Now let's see if you can find me when I hide!",
                next: null
            },

            found1: {
                text: "What?! You found me already?",
                choices: [
                    { text: "Got you!", next: null },
                    { text: "Too easy!", next: null }
                ]
            },

            found2: {
                text: "How are you doing this?! Are you cheating?",
                choices: [
                    { text: "Just good eyesight!", next: null },
                    { text: "Maybe I am...", next: null }
                ]
            },  

            found3: {
                text: "Okay okay, you win this round!",
                next: "finale"
            },

            finale: {
                text: "You're better at this than I thought!",
                choices: [
                    { text: "Thanks!", next: null }
                ],
                done: true
            }
        }
    },

    phase3: {
        nodes: {
            intro: {
                text: "Alright, let's see if you can catch me while I'm moving!",
                next: null
            },

            caught1: {
                text: "Hey! No fair!",
                next: null
            },

            caught2: {
                text: "You're faster than you look!",
                choices: [
                    { text: "I'm just getting started!", next: null },
                    { text: "Can't escape me!", next: null }
                ]
            },

            caught3: {
                text: "Okay okay! You got me! Stop clicking me already! I have Haphephobia!",
                choices: [
                    { text: "That was fun!", next: "finale" },
                    { text: "Good game!", next: "finale" }
                ]
            },

            finale: {
                text: "You're pretty impressive! Alright, you've earned your way in. Welcome to the website!",
                choices: [
                    { text: "Thanks, Lumie!", next: null }
                ],
                done: true
            }
        }
    },

    phase4: {
        nodes: {
            end: {
                text: "Alright, you need to click me to enter...",
                next: null
            }
        }
    }
};