import type { ContentBlock } from "../../data/about/types";
import RichText from "./RichText";

type SectionBlocksProps = {
    blocks: ContentBlock[];
};

const paragraphClassName =
    "text-base sm:text-lg md:text-[1.15rem] leading-relaxed font-medium text-white/90 mb-4";

const sizeClass: Record<"sm" | "md" | "lg", string> = {
    sm: "w-[40%] max-w-[200px] min-w-[140px]",
    md: "w-[48%] max-w-[280px] min-w-[160px]",
    lg: "w-[56%] max-w-[360px] min-w-[180px]",
};

function ImageBlock({
    block,
}: {
    block: Extract<ContentBlock, { type: "image" }>;
}) {
    const place = block.place ?? "center";
    const size = block.size ?? "md";

    const figureClass =
        place === "center"
            ? "my-8 flex flex-col items-center w-full max-w-md mx-auto clear-both"
            : place === "left"
              ? `
                    my-3 mx-auto
                    ${sizeClass[size]}
                    laptop:float-left laptop:mr-6 laptop:mb-3 laptop:mt-1 laptop:mx-0
                `
              : `
                    my-3 mx-auto
                    ${sizeClass[size]}
                    laptop:float-right laptop:ml-6 laptop:mb-3 laptop:mt-1 laptop:mx-0
                `;

    const img = (
        <img
            src={block.src}
            alt={block.alt ?? block.caption ?? ""}
            className="w-full max-h-[340px] object-contain drop-shadow-xl"
        />
    );

    return (
        <figure className={figureClass}>
            {block.href ? (
                <a
                    href={block.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full transition-transform duration-300 hover:-translate-y-0.5"
                >
                    {img}
                </a>
            ) : (
                img
            )}
            {block.caption && (
                <figcaption
                    className={`
                        mt-2 text-sm text-white/60 italic whitespace-pre-wrap
                        ${place === "center" ? "text-center" : "text-center laptop:text-left"}
                    `}
                >
                    {block.caption}
                </figcaption>
            )}
        </figure>
    );
}

/**
 * Magazine-style flow: paragraphs and images share one column.
 * Floated images sit beside the text that follows them in `blocks`.
 */
export default function SectionBlocks({ blocks }: SectionBlocksProps) {
    return (
        <div className="flow-root">
            {blocks.map((block, idx) => {
                if (block.type === "paragraph") {
                    return (
                        <RichText
                            key={idx}
                            paragraphs={[block.spans]}
                            paragraphClassName={paragraphClassName}
                        />
                    );
                }

                return <ImageBlock key={idx} block={block} />;
            })}
        </div>
    );
}
