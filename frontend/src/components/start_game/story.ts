import type { StoryType } from "./story_type";

export const story: StoryType = {
    phase0: {
        intro: ["What do you think you are doing?"],
        userResponses1: ["?", "I'm just trying to click the button…"],
        buttonResponse1: ["I'm talking to YOU! Yes I am a talking button!"],
        userResponses2: ["Wow, I've never seen a talking button before.", "…Sure. Why not."],
        buttonFinal: ["That's it you're gonna have to work to get into this website!"]
    },

    phase1: {
        taunts: [
            "Missed me!",
            "Too slow!",
            "Try harder!",
            "Is that all you've got?",
            "A toddler could click faster!",
            "My grandma moves quicker!",
            "Are you even trying?",
            "Ha! Try harder!",
            "You’ll need lightning reflexes for this!",
            "Keep chasing… I dare you!",
            "Oops, too slow!",
            "Pathetic! I expected better!",
            "You’re making this way too easy for me!",
            "Think you can catch me? Hah!",
            "You’ll need more than luck!",
            "Not even close!",
            "Try again, human!",
            "I’m just getting started!",
            "Is that all your skill?",
            "You can’t handle this speed!"
        ],
        finale: [
            "Ok, you're getting pretty good at this.",
        ]
    },

    phase2: {
        intro: [
            "Now let's see if you can find me!",
        ],
        foundLines: [
            "Impossible! You must be cheating! Let's see you find me NOW!",
            "How did you find me?! Are you using devtools? How about now?",
            "Are you tracking my CSS? That's illegal in 3 states!",
            "STOP FINDING ME! I'M SUPPOSED TO BE INVISIBLE! That's it, you'll never find me now!",
            "You're hacking! No NORMAL human can do this!"
        ],
        finale: [
            "Ok, it's pretty clear you're cheating now."
        ]
    },

    phase3: {
        intro: [
            "If I can't hide I'll run!",
        ],
        caughtLines: [
            "Ok, time to up the speed!",
            "Don't think you can catch up that easily!",
            "No you don't!",
            "I'm really not built for cardio!",
            "Ow! Watch where you put that cursor!"
        ],
        finale: [
            "Okay! OKAY! You win!",
            "You can enter the website…",
            "Just promise to stop trying to click me, I have Haphephobia"
        ]
    }
};