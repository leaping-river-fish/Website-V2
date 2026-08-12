import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, useEffect, useLayoutEffect } from "react";

import { timelineEvents } from "../../data/about/timeline";
import type { TimelineEvent } from "../../data/about/types";
import AppLink from "../reusable_misc/AppLink";
import RichText from "./RichText";
import TextImageBlock from "./TextImageBlock";

const STAGE_CLASS = "w-full max-w-[1600px] mx-auto px-8 laptop:px-16";

/** Extra SVG height past the events track so the line reaches into the fog */
const PATH_OVERFLOW_PX = 480;
/** ViewBox Y range that maps to the events track (elbows are authored in this space) */
const VIEWBOX_EVENTS_H = 2000;

function TimelineEventSection({
    event,
    sectionX,
    sectionOpacity,
    imageX,
}: {
    event: TimelineEvent;
    sectionX: MotionValue<string>;
    sectionOpacity: MotionValue<number>;
    imageX: MotionValue<string>;
}) {
    const text = (
        <div
            className={`
                text-left
                font-bold
                text-base laptop:text-[1.2rem]
                max-w-full laptop:max-w-[700px]
                ${event.imageSide === "right"
                    ? "pr-2 laptop:pr-4"
                    : "pl-2 laptop:pl-4"}
            `}
        >
            {event.role && (
                <p className="text-sm laptop:text-base font-semibold text-white/80 mb-2">
                    {event.role}
                </p>
            )}
            <h3 className="text-xl laptop:text-2xl mb-4">{event.company}</h3>
            <RichText
                paragraphs={event.paragraphs}
                className="space-y-3"
                paragraphClassName="leading-relaxed"
            />
        </div>
    );

    const image = (
        <motion.div
            className="flex items-start pt-8 pb-10 w-auto z-30"
            style={{ x: imageX }}
        >
            {event.href ? (
                <AppLink
                    href={event.href}
                    className="pointer-events-auto"
                >
                    <img
                        src={event.image}
                        className="
                            w-56 laptop:w-64 desktop:w-72
                            max-h-[400px] object-contain
                            rounded-2xl
                            shadow-xl
                            transition-transform duration-300 hover:-translate-y-1
                        "
                        alt={`${event.company} logo`}
                    />
                </AppLink>
            ) : (
                <img
                    src={event.image}
                    className="
                        w-56 laptop:w-64 desktop:w-72
                        max-h-[400px] object-contain
                        rounded-2xl
                        shadow-xl
                    "
                    alt={`${event.company} logo`}
                />
            )}
        </motion.div>
    );

    return (
        <motion.section
            className="relative mt-10"
            style={{
                x: sectionX,
                opacity: sectionOpacity,
            }}
        >
            <div className="absolute inset-0 z-0" style={{ backgroundColor: event.color }} />
            <div className={`relative z-20 py-20 ${STAGE_CLASS}`}>
                <TextImageBlock text={text} image={image} imageSide={event.imageSide} />
            </div>
        </motion.section>
    );
}

export default function CareerTimeline() {
    const timelineRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [trackHeight, setTrackHeight] = useState(0);

    const { scrollYProgress } = useScroll({
        target: timelineRef,
        // Start a bit later so upper About sections don't steal early progress
        offset: ["start 70%", "end 25%"],
    });

    // Reveal windows tuned for three events + title; adjust ranges if you add more events
    const section1X = useTransform(scrollYProgress, [0.08, 0.22], ["-15%", "0%"]);
    const section1Opacity = useTransform(scrollYProgress, [0.08, 0.22], [0, 1]);
    const image1X = useTransform(scrollYProgress, [0.12, 0.24], ["10%", "0%"]);

    const section2X = useTransform(scrollYProgress, [0.32, 0.46], ["15%", "0%"]);
    const section2Opacity = useTransform(scrollYProgress, [0.32, 0.46], [0, 1]);
    const image2X = useTransform(scrollYProgress, [0.36, 0.48], ["-10%", "0%"]);

    const section3X = useTransform(scrollYProgress, [0.56, 0.70], ["-15%", "0%"]);
    const section3Opacity = useTransform(scrollYProgress, [0.56, 0.70], [0, 1]);
    const image3X = useTransform(scrollYProgress, [0.60, 0.72], ["10%", "0%"]);

    const titleX = useTransform(scrollYProgress, [0, 0.08], ["-15%", "0%"]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState<number | null>(null);

    // Scale viewBox with the overflow so elbows (authored in 0..2000) stay on the events track
    const svgHeight = trackHeight > 0 ? trackHeight + PATH_OVERFLOW_PX : undefined;
    const viewBoxH =
        trackHeight > 0
            ? (VIEWBOX_EVENTS_H * (trackHeight + PATH_OVERFLOW_PX)) / trackHeight
            : VIEWBOX_EVENTS_H;

    // Starts near the header, then snakes through three event bands and into the fog
    const pathD = `M600,90 H960 V760 H200 V1400 H960 V${viewBoxH}`;

    const dashOffset = useTransform(
        scrollYProgress,
        [0.18, 0.88],
        [pathLength ?? 1, 0]
    );

    useLayoutEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const measure = () => setTrackHeight(el.getBoundingClientRect().height);
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [pathD]);

    const eventMotions = [
        { sectionX: section1X, sectionOpacity: section1Opacity, imageX: image1X },
        { sectionX: section2X, sectionOpacity: section2Opacity, imageX: image2X },
        { sectionX: section3X, sectionOpacity: section3Opacity, imageX: image3X },
    ];

    return (
        <div ref={timelineRef} className="relative w-full py-14">
            {/* Path is taller than this track; viewBox scales so elbows stay aligned */}
            <div ref={trackRef} className="relative">
                <div
                    className="pointer-events-none absolute top-0 left-1/2 z-30 w-full max-w-[1600px] -translate-x-1/2 px-8 laptop:px-16"
                    style={{ height: svgHeight ?? "100%" }}
                >
                    <div className="relative h-full w-full">
                        <svg
                            className="absolute inset-0 h-full w-full"
                            viewBox={`0 0 1200 ${viewBoxH}`}
                            preserveAspectRatio="none"
                        >
                            <path
                                ref={pathRef}
                                d={pathD}
                                stroke="transparent"
                                strokeWidth="3"
                                fill="none"
                            />

                            {pathLength !== null && (
                                <motion.path
                                    d={pathD}
                                    stroke="#ffffff"
                                    strokeWidth="3"
                                    fill="transparent"
                                    strokeDasharray={pathLength}
                                    style={{ strokeDashoffset: dashOffset }}
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                <div className={STAGE_CLASS}>
                    <motion.h1
                        className="font-bold text-left pt-6 text-[clamp(3.5rem,6vw,6.5rem)] leading-[0.8] mb-10 relative z-10"
                        style={{
                            x: titleX,
                            opacity: titleOpacity,
                        }}
                    >
                        Career Timeline
                    </motion.h1>
                </div>

                {timelineEvents.map((event, idx) => {
                    const motionValues = eventMotions[idx];
                    if (!motionValues) return null;

                    return (
                        <TimelineEventSection
                            key={event.id}
                            event={event}
                            sectionX={motionValues.sectionX}
                            sectionOpacity={motionValues.sectionOpacity}
                            imageX={motionValues.imageX}
                        />
                    );
                })}
            </div>

            <section className="relative z-10 py-10">
                <h2 className="text-center text-3xl font-semibold">To be continued...</h2>
            </section>
        </div>
    );
}
