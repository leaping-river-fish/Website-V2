import React, { createContext, useContext, useState, useEffect } from "react";

interface ImageData {
    src: string;
    alt: string;
    category: string;
}

interface ImageContextType {
    fundraisingImages: ImageData[];
    eventImages: ImageData[];
    artImages: ImageData[];
    isLoading: boolean;
}

export const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = () => {
    const ctx = useContext(ImageContext);
    
    if (!ctx) {
        throw new Error("useImageContext must be used within an ImageProvider");
    }

    return ctx;
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fundraisingImages, setFundraisingImages] = useState<ImageData[]>([]);
    const [eventImages, setEventImages] = useState<ImageData[]>([]);
    const [artImages, setArtImages] = useState<ImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const [fundraising, event, art] = await Promise.all([
                    fetch("http://localhost:5000/getImages?category=Fundraising").then(res => res.json()),
                    fetch("http://localhost:5000/getImages?category=Event-Advertising").then(res => res.json()),
                    fetch("http://localhost:5000/getImages?category=Art").then(res => res.json()),
                ]);

                setFundraisingImages(fundraising);
                setEventImages(event);
                setArtImages(art);
            } catch (error) {
                console.log("Error fetching images:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadImages();
    }, []);

    return (
        <ImageContext.Provider value={{ fundraisingImages, eventImages, artImages, isLoading }}>
            {children}
        </ImageContext.Provider>
    );
}
