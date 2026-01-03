import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

import RifoImg from "/images/timeline_imgs/rifo.png";
import DaitaflowImg from "/images/timeline_imgs/daitaflow.png";

// import FogOfWar from "../effects/FogOfWar";

export default function CareerTimeline() {
    const timelineRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start 80%", "end 20%"],
    });

    const section1X = useTransform(scrollYProgress, [0.1, 0.3], [-300, 0]);
    const section1Opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

    const section2X = useTransform(scrollYProgress, [0.4, 0.6], [300, 0]);
    const section2Opacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

    const image1X = useTransform(scrollYProgress, [0.15, 0.3], [-100, 0]);
    const image2X = useTransform(scrollYProgress, [0.45, 0.6], [100, 0]);

    const titleX = useTransform(scrollYProgress, [0, 0.1], [-300, 0]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    {/* Path logic */}

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState<number | null>(null);

    const dashOffset = useTransform(
        scrollYProgress,
        [0.25, 0.77], // change when line starts and ends
        [pathLength ?? 1, 0]
    );

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <div ref={timelineRef} className="relative w-full py-14">
            {/* TITLE */}
            <motion.h1
                className="font-bold text-left pl-6 pt-6 text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[8rem] leading-[0.8] mb-10 relative z-10"
                style={{
                    x: titleX,
                    opacity: titleOpacity,
                }}
            >
                Career Timeline
            </motion.h1>

            {/* Timeline Path */}
            <svg
                className="absolute top-[60px] left-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 1200 1400"
                preserveAspectRatio="none"
            >
                {/* Measurement Path */}
                <path
                    ref={pathRef}
                    d="M770,75 H960 V675 H300 V1150 H960 V1350"
                    stroke="transparent"
                    strokeWidth="3"
                    fill="none"
                />

                {pathLength !== null && (
                    <motion.path
                        d="M770,75 H960 V675 H300 V1150 H960 V1350"
                        stroke="#ffffff"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={pathLength}
                        style={{ strokeDashoffset: dashOffset }}
                        strokeLinecap="round"
                    />
                )}
            </svg>

            <motion.section
                className="relative mt-10"
                style={{
                    x: section1X,
                    opacity: section1Opacity,
                }}
            >
                <div className="absolute inset-0 bg-[#007ACC] z-0" />

                <div className="relative z-20 py-20">
                    <div className="grid md:grid-cols-2 items-center">
                        <div
                            className="
                                text-left 
                                font-bold 
                                text-base sm:text-lg md:text-[1.2rem]
                                max-w-full sm:max-w-[500px] md:max-w-[700px]
                                pl-6 sm:pl-12 md:pl-[150px]
                            "
                        >
                            <p>
                                During my first internship, I worked as a QA Engineer for RIFO
                                Holding Group as part of the R&D team. I automated test cases
                                for their client, agent, and vendor applications using Python
                                scripts. Throughout the internship, I built strong relationships
                                with my colleagues and developed valuable skills in app testing.
                                I also gained hands-on experience with tools such as Appium and
                                Selenium for automation, as well as Clipchamp and Canva for
                                creating demo videos through video editing.
                            </p>
                        </div>

                        <motion.div
                            className="flex justify-end items-start pr-10 md:pr-40 pt-24 pb-30 w-auto z-30"
                            style={{ x: image1X }}
                        >
                            <a
                                href="https://www.rifo.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pointer-events-auto"
                            >
                                <img
                                    src={RifoImg}
                                    className="
                                        w-40 sm:w-56 md:w-64 lg:w-72
                                        max-h-[400px]
                                        rounded-2xl
                                        shadow-xl
                                        transition-transform duration-300 hover:-translate-y-1
                                    "
                                    alt="RIFO Logo"
                                />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                className="relative mt-10"
                style={{
                    x: section2X,
                    opacity: section2Opacity,
                }}
            >
                <div className="absolute inset-0 bg-[#00aeef] z-0" />

                <div className="relative z-20 py-20">
                    <div className="grid md:grid-cols-2 items-center">
                        <motion.div
                            className="flex justify-end items-start pr-10 md:pr-60 pt-24 pb-30 w-auto z-30"
                            style={{ x: image2X }}
                        >
                            <a
                                href="https://www.rifo.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pointer-events-auto"
                            >
                                <img
                                    src={DaitaflowImg}
                                    className="
                                        w-40 sm:w-56 md:w-64 lg:w-72
                                        max-h-[400px]
                                        rounded-2xl
                                        shadow-xl
                                        transition-transform duration-300 hover:-translate-y-1
                                    "
                                    alt="Daitaflow Logo"
                                />
                            </a>
                        </motion.div>

                        <div
                            className="
                                text-left 
                                font-bold 
                                text-base sm:text-lg md:text-[1.2rem]
                                max-w-full sm:max-w-[500px] md:max-w-[700px]
                                pl-6 sm:pl-12 md:pl-[150px]
                            "
                        >
                            <p>
                                For my second internship, I worked at a startup called 
                                dAItaflow Automated Software Administration Inc. as
                                a full-stack developer. I built the frontend UI for 
                                the change management forms using JavaScript and 
                                integrated the backend using Python and Django. I
                                developed the whitelisting and notification system,
                                creating new Django models to suit the need of each
                                system. Lastly, I worked with HubSpot to create our
                                company's landing page.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.section>

            <section className="py-10">
                <h1 className="text-center text-3xl">To be continued...</h1>
            </section>
            
            {/* <FogOfWar scrollYProgress={scrollYProgress} /> */}
        </div>
    );
}