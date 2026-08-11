import type { ReactNode } from "react";

type TextImageBlockProps = {
    text: ReactNode;
    image?: ReactNode;
    imageSide?: "left" | "right";
    className?: string;
};

/**
 * Responsive text + image(s) column layout.
 * Mobile: stacks image column then text. Laptop+: two-column grid with imageSide.
 */
export default function TextImageBlock({
    text,
    image,
    imageSide = "right",
    className = "",
}: TextImageBlockProps) {
    const hasImage = Boolean(image);
    const imageFirstOnDesktop = imageSide === "left";

    return (
        <div
            className={`
                grid items-start gap-8 laptop:gap-12
                ${hasImage ? "laptop:grid-cols-2" : "grid-cols-1"}
                ${className}
            `}
        >
            <div
                className={`
                    min-w-0
                    ${hasImage && imageFirstOnDesktop ? "laptop:order-2" : "laptop:order-1"}
                    order-2
                `}
            >
                {text}
            </div>

            {hasImage && (
                <div
                    className={`
                        flex justify-center
                        ${imageFirstOnDesktop ? "laptop:justify-end laptop:order-1" : "laptop:justify-start laptop:order-2"}
                        order-1
                    `}
                >
                    {image}
                </div>
            )}
        </div>
    );
}

