import type { InlineSpan } from "../../data/about/types";

type RichTextProps = {
    paragraphs: InlineSpan[][];
    className?: string;
    paragraphClassName?: string;
};

const linkClassName =
    "underline underline-offset-2 decoration-white/70 hover:decoration-white transition-colors font-semibold";

export default function RichText({
    paragraphs,
    className = "",
    paragraphClassName = "",
}: RichTextProps) {
    return (
        <div className={className}>
            {paragraphs.map((spans, pIdx) => (
                <p key={pIdx} className={paragraphClassName}>
                    {spans.map((span, sIdx) =>
                        span.type === "link" ? (
                            <a
                                key={sIdx}
                                href={span.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClassName}
                            >
                                {span.text}
                            </a>
                        ) : (
                            <span key={sIdx}>{span.text}</span>
                        )
                    )}
                </p>
            ))}
        </div>
    );
}
