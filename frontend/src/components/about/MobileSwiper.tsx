import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { timelineEvents } from "../../data/about/timeline";
import RichText from "./RichText";

export default function MobileSwiper() {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeColor = timelineEvents[activeIndex]?.color ?? "#1A1410";

    return (
        <div className="block laptop:hidden relative w-full py-8 sm:py-12">
            <h1 className="font-bold pl-4 pt-6 text-[3rem] leading-[0.8] mb-10">
                Career Timeline
            </h1>

            <div
                className="px-4 py-12 mb-16 min-h-[80vh] transition-colors duration-500"
                style={{ backgroundColor: activeColor }}
            >
                <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    spaceBetween={20}
                    slidesPerView={1}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                    {timelineEvents.map((event) => (
                        <SwiperSlide key={event.id} className="flex items-center">
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                                <img
                                    src={event.image}
                                    alt={`${event.company} logo`}
                                    className="w-full h-auto max-h-[280px] object-contain rounded-xl shadow-lg mb-4"
                                />

                                {event.role && (
                                    <p className="text-sm font-semibold text-white/80 mb-1">
                                        {event.role}
                                    </p>
                                )}

                                <h2 className="text-2xl font-bold mb-2">{event.company}</h2>

                                <RichText
                                    paragraphs={event.paragraphs}
                                    className="mb-4 space-y-3"
                                    paragraphClassName="text-base leading-relaxed"
                                />

                                {event.href && (
                                    <a
                                        href={event.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white underline underline-offset-2 font-semibold"
                                    >
                                        Visit Website →
                                    </a>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
