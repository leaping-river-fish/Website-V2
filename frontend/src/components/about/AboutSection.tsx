import type { AboutSectionData } from "../../data/about/types";
import SectionBlocks from "./SectionBlocks";

type AboutSectionProps = {
    section: AboutSectionData;
};

export default function AboutSection({ section }: AboutSectionProps) {
    return (
        <section
            id={section.id}
            className="relative w-full py-14 sm:py-16 laptop:py-24 border-b border-white/5"
        >
            <div className="px-6 sm:px-10 laptop:px-16 max-w-3xl laptop:max-w-4xl mx-auto">
                {section.headline && (
                    <h2 className="font-bold text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] leading-[0.9] mb-6 sm:mb-8">
                        {section.headline}
                    </h2>
                )}
                <SectionBlocks blocks={section.blocks} />
            </div>
        </section>
    );
}
