// add empty slots for locked entries? preload images to reduce lag
import React, { useState, useMemo } from "react";
import { useImageContext } from "../contexts/ImageContext";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Share from "yet-another-react-lightbox/plugins/share";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

const Gallery: React.FC = () => {
    const { fundraisingImages, eventImages, artImages, isLoading } = useImageContext();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const slides = useMemo(() => {
        return [...artImages, ...fundraisingImages, ...eventImages].map((img) => ({
            src: img.src,
            title: img.alt,
            description: img.alt,
        }));
    }, [artImages, fundraisingImages, eventImages]);

    const openLightbox = (src: string) => {
        const allImages = [...artImages, ...fundraisingImages, ...eventImages];
        const index = allImages.findIndex((img) => img.src === src);
        if (index !== -1) {
            setCurrentIndex(index);
            setIsLightboxOpen(true);
        }
    }

    const Section = (props: { title: string; images: any[] }) => (
        <div className="mb-16 w-full">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">{props.title}</h2>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="w-full h-48 bg-neutral-700 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                    {props.images.map((img) => (
                        <img
                            key={img.src}
                            src={img.src}
                            alt={img.alt}
                            className="w-full rounded-xl shadow-md cursor-pointer hover:scale-107 duration-300 ease-out opacity-80 transition"
                            onClick={() => openLightbox(img.src)}
                            loading="lazy"
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-[#1A1410] w-full max-w-6xl mx-auto pt-10 pb-20 px-4">
            <Section title="Art" images={artImages} />
            <Section title="Fundraising" images={fundraisingImages} />
            <Section title="Event Advertising" images={eventImages} />

            {isLightboxOpen && currentIndex !== null && (
                <Lightbox
                    open={isLightboxOpen}
                    close={() => setIsLightboxOpen(false)}
                    index={currentIndex}
                    slides={slides}
                    plugins={[Zoom, Captions, Download, Share]}
                />
            )}
        </div>
    );
}

export default Gallery