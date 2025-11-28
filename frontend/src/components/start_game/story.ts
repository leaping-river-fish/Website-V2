import type { StoryType } from "./story_type";

export const story: StoryType = {
    phase0: {
        nodes: {
            start: {
                text: "What do you think you're doing?",
                choices: [
                    { text: "?", next: "buttonResponse1" },
                    { text: "I'm just trying to click the button…", next: "buttonResponse2" }
                ]
            },

            buttonResponse1: {
                text: "HELLO, I'M TALKING TO YOU! ME, THE BUTTON!",
                next: "argue"
            },

            buttonResponse2: {
                text: "I AM THE BUTTON! I'M TALKING TO YOU!",
                next: "argue"
            },

            argue: {
                text: "Are you gonna acknowledge my existence?",
                choices: [
                    { text: "You're probably just a bunch of parameters...", next: "finale" },
                    { text: "I've never met a talking button before...", next: "finale" }
                ]
            },

            finale: {
                text: "That's it you're gonna have to work to get into this website! See if you can click me now!",
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
                text: "Let's see if you can keep up.",
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
                text: "Now let's see if you can find me!",
                next: null
            },

            found1: {
                text: "Impossible! You must be cheating!",
                choices: [
                    { text: "I found you!", next: null },
                    { text: "Too easy!", next: null }
                ]
            },

            found2: {
                text: "How did you find me?! Are you using devtools?",
                choices: [
                    { text: "No cheats, just skill!", next: null },
                    { text: "Maybe...", next: null }
                ]
            },  

            found3: {
                text: "Are you actually tracking my CSS? That's illegal!",
                next: null
            },

            found4: {
                text: "STOP FINDING ME! I'M SUPPOSED TO BE INVISIBLE! That's it, you'll never find me now!",
                choices: [
                    { text: "I won't stop!", next: null },
                    { text: "We'll see about that!", next: null }
                ]
            },

            found5: {
                text: "You're hacking! No NORMAL human can do this!",
                next: "finale"
            },

            finale: {
                text: "Ok, it's pretty clear you're cheating now.",
                choices: [
                    { text: "Sore loser...", next: null }
                ],
                done: true
            }
        }
    },

    phase3: {
        nodes: {
            intro: {
                text: "If I can't hide I'll run!",
                next: null
            },

            caught1: {
                text: "Ok, time to up the speed!",
                next: null
            },

            caught2: {
                text: "Don't think you can catch up that easily!",
                choices: [
                    { text: "I'll catch you!", next: null },
                    { text: "Nowhere to run!", next: null }
                ]
            },

            caught3: {
                text: "No you don't!",
                next: null
            },

            caught4: {
                text: "I'm really not built for cardio!",
                choices: [
                    { text: "You should stop then...", next: null },
                    { text: "Neither am I...", next: null }
                ]
            },

            caught5: {
                text: "Ow! Watch where you put that cursor!",
                choices: [
                    { text: "That was your fault!", next: "finale" },
                    { text: "Shouldn't have been going 50 over the limit...", next: "finale" }
                ]
            },

            finale: {
                text: "Okay! OKAY! You win! You can enter the website… Just promise to stop trying to click me, I have Haphephobia",
                choices: [
                    { text: "Ironic...", next: null }
                ],
                done: true
            }
        }
    },

    phase4: {
        nodes: {
            end: {
                text: "You may enter the website now...",
                next: null
            }
        }
    }
};