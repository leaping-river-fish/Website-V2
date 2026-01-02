import { useState } from "react";

interface GalleryImageProps {
    img: {
        src: string;
        alt: string;
    };
    animateIn: Boolean;
    onClick: () => void;
}

export default function GalleryImage({ img, onClick, animateIn }: GalleryImageProps) {
    const [loaded, setLoaded] = useState(false);

    const shouldAnimate = animateIn && !loaded;

    return (
        <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            onLoad={() => {setLoaded(true)}}
            onClick={onClick}
            className={`
                w-full rounded-xl shadow-md cursor-pointer
                transition-all duration-500 ease-out
                ${shouldAnimate ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                hover:scale-105
            `}
        />
    );
}