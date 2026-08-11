import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";
import { usePageTracking } from "../components/quests/usePageTracking";

import AboutSection from "../components/about/AboutSection";
import CareerTimeline from "../components/about/CareerTimeline";
import MobileSwiper from "../components/about/MobileSwiper";
import StaticFogOfWar from "../components/effects/StaticFogOfWar";

import { aboutSections } from "../data/about/sections";

function About() {
    usePageTracking("about");

    return (
        <div className="bg-[#1A1410] min-h-screen text-white overflow-hidden">
            <NavbarSpacer />

            {/* Custom sections — edit data/about/sections.ts */}
            <div className="relative w-full">
                {aboutSections.map((section) => (
                    <AboutSection key={section.id} section={section} />
                ))}
            </div>

            {/* Career timeline — always last */}
            <div className="relative w-full py-8 sm:py-12">
                <MobileSwiper />

                <div className="hidden laptop:block">
                    <CareerTimeline />
                </div>
            </div>

            <div className="relative z-40 mt-16 pointer-events-none">
                <StaticFogOfWar height={300} />
            </div>
        </div>
    );
}

export default About;
