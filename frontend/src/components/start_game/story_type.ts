export interface StoryType {
    phase0: {
        intro: string[];
        userResponses1: string[];
        buttonResponse1: string[];
        userResponses2: string[];
        buttonFinal: string[];
    };
    phase1: {
        taunts: string[];
        finale: string[];
    };
    phase2: {
        intro: string[];
        foundLines: string[];
        finale: string[];
    };
    phase3: {
        intro: string[];
        caughtLines: string[];
        finale: string[];
    };
}