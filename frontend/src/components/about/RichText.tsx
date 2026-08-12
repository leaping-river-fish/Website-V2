import type { InlineSpan } from "../../data/about/types";
import AppLink from "../reusable_misc/AppLink";

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
                            <AppLink
                                key={sIdx}
                                href={span.href}
                                className={linkClassName}
                            >
                                {span.text}
                            </AppLink>
                        ) : (
                            <span key={sIdx}>{span.text}</span>
                        )
                    )}
                </p>
            ))}
        </div>
    );
}
