import type { AboutSectionData } from "./types";

/**
 * Ordered About page sections (timeline is rendered separately, after these).
 *
 * Arrange freely with `blocks` — reading order top to bottom.
 *   { type: "paragraph", spans: [...] }
 *   { type: "image", src, alt?, caption?, place?: "left"|"right"|"center", size?: "sm"|"md"|"lg", href? }
 *
 * Tip: put an image block *before* the paragraphs you want wrapping beside it.
 * Use place "center" when you want a break (no wrap).
 */
export const aboutSections: AboutSectionData[] = [
    {
        id: "intro",
        headline: "About",
        blocks: [
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "Hey! In case you skipped the homepage, I'm Nick, a Systems Design Engineer student at the University of Waterloo. Already knew that? Bet you didn't know that I'm the eldest of four siblings. ",
                    },
                ],
            },
            {
                type: "image",
                src: "/images/about/siblings_y.jpeg",
                alt: "Lumie",
                caption: "                               Hey, it's me ^",
                place: "right",
                size: "md",
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "Welcome to my website! Here you can find more about me, my hobbies, and my projects. Head to the ",
                    },
                    {
                        type: "link",
                        text: "projects page",
                        href: "https://asklumie.me/projects",
                    },
                    {
                        type: "text",
                        text: " to see my work. Or visit my ",
                    },
                    {
                        type: "link",
                        text: "GitHub",
                        href: "https://github.com/leaping-river-fish",
                    },
                    {
                        type: "text",
                        text: " instead. Want to see some art? Head over to the ",
                    },
                    {
                        type: "link",
                        text: "gallery page",
                        href: "https://asklumie.me/gallery",
                    },
                    {
                        type: "text",
                        text: "!",
                    },
                ],
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "You could also check out some of the other features of my website like the ",
                    },
                    {
                        type: "link",
                        text: "shop",
                        href: "https://asklumie.me/shop",
                    },
                    {
                        type: "text",
                        text: " or the ",
                    },
                    {
                        type: "link",
                        text: "achievements page",
                        href: "https://asklumie.me/achievements",
                    },
                    {
                        type: "text",
                        text: "!",
                    },
                ],
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "Are you still reading? If you want to know more about me, you can keep scrolling to find out more about my hobbies and career below.",
                    },
                ],
            },
        ],
    },
    {
        id: "hobbies",
        headline: "Hobbies",
        blocks: [
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "Things I enjoy doing in my free time include pokemon collecting, playing video games, and sports. All preferrably with friends.",
                    },
                ],
            },
            {
                type: "image",
                src: "/images/about/ceruledge_sir.jpg",
                alt: "Ceruledge Sir",
                caption: "My favourite card.",
                place: "right",
                size: "sm",
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "My favourite pokemon design is probably Ceruledge. I've always resonated with most with the fire type because it represents passion, energy, determination, and a drive to keep moving forward. Ceruledge takes that and puts a dark twist on it with its signature move, Bitter Blade.",
                    },
                ],
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "The game I play most with my friends is League of Legends. It's what kept my friend group together when we all moved away from each other in 7th grade. My favourite game mode is ARAM: Mayhem. Although the game probably took years off my life, those days were some of the best.",
                    },
                ],
            },
            {
                type: "image",
                src: "/images/about/grass_win.jpeg",
                alt: "Grass volleyball",
                caption: "SERVE grass volleyball tournament winners (I'm on the right)",
                place: "left",
                size: "md",
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "My main sport was badminton in high school, but now I almost exclusively play volleyball whether indoor, beach, or grass. I joined SERVE and won my first grass tournament!",
                    },
                ],
            },
            {
                type: "paragraph",
                spans: [
                    {
                        type: "text",
                        text: "In university, I also picked up football (or soccer) again because my program has a team. Although I'm not the greatest, it's still really fun to play a team sport with friends. We even won the finals in our third term playing!",
                    },
                ],
            },
            {
                type: "image",
                src: "/images/about/Syde_win.jpeg",
                alt: "SYDEMen Finals winners",
                caption: "SYDEMen Finals winners (I'm top right)",
                place: "right",
                size: "lg",
            },
        ],
    },
];
