import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import RifoImg from "/images/timeline_imgs/rifo.png"
import DaitaflowImg from "/images/timeline_imgs/daitaflow.png"

export default function MobileSwiper() {
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
        <div className="block laptop:hidden relative w-full py-12">
            <h1 className="font-bold pl-4 pt-6 text-[3rem] leading-[0.8] mb-10">
                Career Timeline
            </h1>

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
        </div>
    );
}