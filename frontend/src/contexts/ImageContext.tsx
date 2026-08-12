import React, { createContext, useContext, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

export interface ImageData {
    src: string;
    alt: string;
    category: string;
}

/** Cloudinary tag + display title. Add entries here to introduce new gallery sections. */
export const GALLERY_SECTIONS = [
    { id: "art", title: "Art", category: "Art" },
    { id: "sydequest-the-game", title: "SYDEQuest The Game", category: "SYDEQuest The Game" },
    { id: "off-angle-affinity", title: "Off-Angle: Affinity", category: "Off-Angle: Affinity" },
] as const;

export type GallerySectionId = (typeof GALLERY_SECTIONS)[number]["id"];

export interface GallerySection {
    id: GallerySectionId;
    title: string;
    category: string;
    images: ImageData[];
}

interface ImageContextType {
    sections: GallerySection[];
    allImages: ImageData[];
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
    const res = await fetch(
        `${API_BASE}/fetch?action=images&category=${encodeURIComponent(category)}`
    );
    if (!res.ok) throw new Error("Failed to fetch images");
    return res.json();
}

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queries = useQueries({
        queries: GALLERY_SECTIONS.map((section) => ({
            queryKey: ["images", section.id],
            queryFn: () => fetchImages(section.category),
            staleTime: 1000 * 60 * 30,
            gcTime: 1000 * 60 * 60,
        })),
    });

    const sections = useMemo<GallerySection[]>(
        () =>
            GALLERY_SECTIONS.map((section, i) => ({
                id: section.id,
                title: section.title,
                category: section.category,
                images: queries[i]?.data ?? [],
            })),
        [queries]
    );

    const allImages = useMemo(
        () => sections.flatMap((section) => section.images),
        [sections]
    );

    const isLoading = queries.some((q) => q.isLoading);

    return (
        <ImageContext.Provider
            value={{
                sections,
                allImages,
                isLoading,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
