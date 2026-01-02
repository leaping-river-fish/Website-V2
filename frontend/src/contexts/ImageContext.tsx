import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

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

async function fetchImages(category: string): Promise<ImageData[]> {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(`${API_BASE}/getImages?category=${category}`);
    if (!res.ok) throw new Error("Failed to fetch images");
    return res.json();
}

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const fundraising = useQuery({
        queryKey: ["images", "fundraising"],
        queryFn: () => fetchImages("Fundraising"),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });

    const event = useQuery({
        queryKey: ["images", "event"],
        queryFn: () => fetchImages("Event-Advertising"),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });

    const art = useQuery({
        queryKey: ["images", "art"],
        queryFn: () => fetchImages("Art"),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });

    return (
        <ImageContext.Provider 
            value={{
                fundraisingImages: fundraising.data ?? [],
                eventImages: event.data ?? [],
                artImages: art.data ?? [],
                isLoading: fundraising.isLoading || event.isLoading || art.isLoading,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
}
