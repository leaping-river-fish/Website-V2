export type GitProjectDetails = {
    longDescription?: string;
    /** Card thumbnail — png/jpg/webp/gif paths under /images/... */
    image?: string;
    /** Modal gallery media — mix png/jpg/webp/gif freely; same path format */
    showcaseimages?: string[];
};

/** Hardcoded modal/card enrichment keyed by exact GitHub repo name. */
export const gitProjectDetails: Record<string, GitProjectDetails> = {
    // Example:
    // "my-website2": {
    //   longDescription: "...",
    //   image: "/images/project_imgs/thumb.png",
    //   showcaseimages: [
    //     "/images/project_imgs/shot1.png",
    //     "/images/project_imgs/demo.gif",
    //   ],
    // },
    "SYDEQuest": {
        image: "/images/project_imgs/sydequest7.png",
        showcaseimages: [
            "/images/project_imgs/Level1.png",
            "/images/project_imgs/Level1.gif",
            "/images/project_imgs/Level2.gif",
            "/images/project_imgs/Level3.gif",
            "/images/project_imgs/Boss.gif",
            "/images/project_imgs/sydequest7.png",
        ],
    },
    "FlappyLumie": {
        image: "/images/project_imgs/flappy_lumie.png",
        showcaseimages: [
            "/images/project_imgs/flappy_lumie.png",
            "/images/project_imgs/flap_lumie.gif",
        ],
    },
    "Off-Angle-Affinity": {
        image: "/images/project_imgs/affinitywip.png",
        showcaseimages: [
            "/images/project_imgs/offanglestart.png",
            "/images/project_imgs/loadout.png",
            "/images/project_imgs/affinitywip.png",
            "/images/project_imgs/offangleslide.gif",
            "/images/project_imgs/offanglegrapple.gif",
            "/images/project_imgs/offanglewallrun.gif"
        ],
    },
    "URPaint": {
        image: "/images/project_imgs/urpstudio.png",
        showcaseimages: [
            "/images/project_imgs/urpmain.gif",
            "/images/project_imgs/urpstudio.png",
        ],
    },
};

export function getGitProjectDetails(name: string): GitProjectDetails {
    return gitProjectDetails[name] ?? {};
}
