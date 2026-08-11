import type { TimelineEvent } from "./types";

/**
 * Shared career timeline events for desktop (CareerTimeline) and mobile (MobileSwiper).
 */
export const timelineEvents: TimelineEvent[] = [
    {
        id: "rifo",
        company: "RIFO Holding Group",
        role: "QA Engineer",
        paragraphs: [
            [
                { type: "text", text: "During my first internship, I worked as a QA Engineer for " },
                { type: "link", text: "RIFO Holding Group", href: "https://www.rifo.com/" },
                {
                    type: "text",
                    text: " as part of the R&D team. I automated test cases for their client, agent, and vendor applications using Python scripts. Throughout the internship, I built strong relationships with my colleagues and developed valuable skills in app testing. I also gained hands-on experience with tools such as Appium and Selenium for automation, as well as Clipchamp and Canva for creating demo videos through video editing.",
                },
            ],
        ],
        image: "/images/timeline_imgs/rifo.png",
        href: "https://www.rifo.com/",
        color: "#007ACC",
        imageSide: "right",
    },
    {
        id: "daitaflow",
        company: "dAItaflow",
        role: "Full-stack Developer",
        paragraphs: [
            [
                {
                    type: "text",
                    text: "For my second internship, I worked at a startup called dAItaflow Automated Software Administration Inc. as a full-stack developer. I built the frontend UI for the change management forms using JavaScript and integrated the backend using Python and Django. I developed the whitelisting and notification system, creating new Django models to suit the need of each system. Lastly, I worked with HubSpot to create our company's landing page.",
                },
            ],
        ],
        image: "/images/timeline_imgs/daitaflow.png",
        // TODO: set href when company site is available
        color: "#00aeef",
        imageSide: "left",
    },
    {
        id: "liftwerx",
        company: "LiftWerx",
        role: "VR Game Developer",
        paragraphs: [
            [
                {
                    type: "text",
                    text: "I found myself at LiftWerx for my third internship. I worked as a VR game developer, developing a engineering simulation tool using Unity and C#. I designed the UI on Figma, and implemented game features like poseable dummies. Worked on maintaining parity between VR and Desktop versions of the game ensuring the best user experience for each platform. I was also the QA engineer for the project writing up test cases for future automation.",
                },
            ],
        ],
        // TODO: replace with the real logo
        image: "/images/timeline_imgs/liftwerx_logo.png",
        color: "#96C11F",
        imageSide: "right",
    },
];
