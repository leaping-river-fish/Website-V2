import type { StoryType } from "./story_type";

export const story: StoryType = {
    phase0: {
        nodes: {
            start_returning: {
                text: "AAAAH!",
                emotion: "shock",
                next: "return",
                animation: "scared-jump"
            },
            return: {
                text: "Oh it's you again. Do you want to play again?",
                emotion: "happy",
                choices: [
                    { text: "Not today. (skips intro game)", next: "__SKIP__" },
                    { text: "Yes, I'm challenging you again!", next: "finale" }
                ],
            },
            start: {
                text: "Woah, what do you think you're doing?",
                emotion: "shock",
                choices: [
                    { text: "Who are you?", next: "lumieResponse1" },
                    { text: "I don't know, I was just teleported here...", next: "lumieResponse2" }
                ],
                animation: "shake-x"
            },

            lumieResponse1: {
                text: "I'm Lumie! I'm the guardian of this website. You'll have to prove yourself if you want to leave!",
                emotion: "angry",
                next: "argue",
                animation: "frustrated-wobble"
            },

            lumieResponse2: {
                text: "Yeah, you disturbed my beauty sleep! You owe me a fun game!",
                emotion: "angry",
                next: "argue",
                animation: "frustrated-wobble"
            },

            argue: {
                text: "Think you can keep up with me?",
                emotion: "neutral",
                choices: [
                    { text: "Absolutely! Let's do this!", next: "finale" },
                    { text: "How hard could it be?", next: "finale", animation: "shake-y" }
                ],
            },

            finale: {
                text: "Alright then!",
                emotion: "happy",
                done: true
            }
        }
    },

    phase1: {
        nodes: {
            intro: {
                text: "Let's see if you can keep up. Try to click me!",
                emotion: "happy",
                next: null
            },
            finale: {
                text: "Ok, you're getting pretty good at this.",
                emotion: "unamused",
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
                text: "Now let's see if you can find me!",
                emotion: "happy",
                choices: [
                    { text: "Shouldn't be too hard...", next: null },
                    { text: "Pulling up elements tab...", next: null }
                ],
                next: null
            },

            found1: {
                text: "What?! You found me already?",
                emotion: "shock",
                next: null
            },

            found2: {
                text: "How are you doing this?! Are you cheating?",
                emotion: "shock",
            },  

            found3: {
                text: "Okay okay, you win this round!",
                emotion: "unamused",
                next: "finale"
            },

            finale: {
                text: "You're better at this than I thought!",
                emotion: "unamused",
                done: true
            }
        }
    },

    phase3: {
        nodes: {
            intro: {
                text: "Alright, let's see if you can catch me while I'm moving!",
                emotion: "happy",
                choices: [
                    { text: "Here I come!", next: null },
                ],
                next: null
            },

            caught1: {
                text: "Hey! No fair!",
                emotion: "angry",
                next: null
            },

            caught2: {
                text: "You're faster than you look!",
                emotion: "happy",
                next: null
            },

            caught3: {
                text: "Okay okay! You got me! Stop clicking me already!",
                emotion: "dizzy",
                choices: [
                    { text: "That was fun!", next: "finale" },
                    { text: "Good game!", next: "finale" }
                ]
            },

            finale: {
                text: "You're pretty impressive! Alright, you can leave now.",
                emotion: "greedy",
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
                text: "Alright, click me to leave.",
                emotion: "happy",
                next: null
            }
        }
    }
};