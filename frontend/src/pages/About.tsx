// Add clouds for fog of war effect
import { NavbarSpacer } from "../components/reusable_misc/NavbarSpacer";

import Chatbot from "../components/Chatbot";
import CareerTimeline from "../components/about/CareerTimeline";
import MobileSwiper from "../components/about/MobileSwiper";

import StaticFogOfWar from "../components/effects/StaticFogOfWar";

function About() {

    return (
        <div className="bg-[#1A1410] min-h-screen text-white overflow-hidden">
            
            <NavbarSpacer />

            <Chatbot />
            
            <div className="relative w-full py-12">

                {/* MOBILE SWIPER */}
                <MobileSwiper />

                {/* DESKTOP TIMELINE */}
                <div className="hidden laptop:block">
                    <CareerTimeline />
                </div>
            </div>

            <StaticFogOfWar height={300} />
        </div>
    );
}

export default About