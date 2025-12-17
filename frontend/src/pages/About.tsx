// add timeline animation on scroll, sections slide into place animation on scroll
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import Chatbot from "../components/Chatbot";

import RifoImg from "/images/timeline_imgs/rifo.png"
import DaitaflowImg from "/images/timeline_imgs/daitaflow.png"


function About() {
    const [activeIndex, setActiveIndex] = useState(0);
    const timelineEvents = [
        {
            title: "RIFO Holding Group",
            description: "During my first internship, I worked as a QA Engineer for RIFO Holding Group as part of the R&D team. I automated test cases for their client, agent, and vendor applications using Python scripts. Throughout the internship, I built strong relationships with my colleagues and developed valuable skills in app testing. I also gained hands-on experience with tools such as Appium and Selenium for automation, as well as Clipchamp and Canva for creating demo videos.",
            img: RifoImg,
            link: "https://www.rifo.com/",
            color: "#007ACC",
        },
        {
            title: "DAItaflow",
            description: "For my second internship, I worked at a startup called dAItaflow Automated Software Administration Inc. as a full-stack developer. I built the frontend UI for the change management forms using JavaScript and integrated the backend using Python and Django. I developed the whitelisting and notification system, creating new Django models to suit the need of each system. Lastly, I worked with HubSpot to create our company's landing page.",
            img: DaitaflowImg,
            link: "https://next.com/", // need to change
            color: "#00aeef",
        },
    ]

    return (
        <div className="bg-[#1A1410] min-h-screen text-white overflow-hidden">

            <Chatbot />
            
            <div className="relative w-full py-12">
                <h1
                    className="
                        font-bold 
                        text-left 
                        pl-2 sm:pl-4 md:pl-6
                        pt-6 sm:pt-8 
                        text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[8rem] 
                        leading-[0.8]                                               
                        mb-10                                                        
                        relative z-10
                    "
                >
                    Career Timeline
                </h1>

                {/* MOBILE SWIPER */}
                <div 
                    className="block laptop:hidden px-4 py-12 mb-16 min-h-[80vh] transition-colors duration-500"
                    style={{ backgroundColor: timelineEvents[activeIndex]?.color }}
                >
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true }}
                        spaceBetween={20}
                        slidesPerView={1}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    >
                        {timelineEvents.map((event, idx) => (
                            <SwiperSlide key={idx} className="flex items-center">
                                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                                    <img
                                        src={event.img}
                                        alt={event.title}
                                        className="w-full h-auto rounded-xl shadow-lg mb-4"
                                    />

                                    <h2 className="text-2xl font-bold mb-2">
                                        {event.title}
                                    </h2>

                                    <p className="text-base leading-relaxed mb-4">
                                        {event.description}
                                    </p>

                                    <a
                                        href={event.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white underline font-semibold"
                                    >
                                        Visit Website →
                                    </a>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="hidden laptop:block">
                    <svg 
                        className="absolute top-[60px] left-0 w-full h-full z-0 pointer-events-none"
                        viewBox="0 0 1200 1400"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M770,75 H960 V675 H300 V1150 H960 V1350"
                            stroke="#ffffff"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="5,5"
                        />
                    </svg>

                    <section className="bg-[#007ACC] py-20 mt-10">
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

                            <div className="flex justify-end items-start pr-10 md:pr-40 pt-24 pb-30 w-auto z-10">
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
                                            transition-transform duration-300 hover:-translate-y-1"
                                        alt="RIFO Logo"
                                    />
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#00aeef] py-20 mt-10">
                        <div className="grid md:grid-cols-2 items-center">

                            <div className="flex justify-end items-start pr-10 md:pr-60 pt-24 pb-30 w-auto z-10">
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
                                            transition-transform duration-300 hover:-translate-y-1"
                                        alt="Daitaflow Logo"
                                    />
                                </a>
                            </div>

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
                    </section>

                    <section className="py-10">
                        <h1 className="text-center text-3xl">To be continued...</h1>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default About