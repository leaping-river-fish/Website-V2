export type InlineSpan =
    | { type: "text"; text: string }
    | { type: "link"; text: string; href: string };

/**
 * Ordered content inside a section. Place images between (or before/after)
 * paragraphs — order in this array is the reading order.
 *
 * Image `place`:
 * - "left" / "right" — floats beside following paragraphs (text wraps on laptop+)
 * - "center" — full break in the flow (no wrap)
 */
export type ContentBlock =
    | { type: "paragraph"; spans: InlineSpan[] }
    | {
          type: "image";
          src: string;
          alt?: string;
          caption?: string;
          place?: "left" | "right" | "center";
          /** Visual size of floated/centered images (default: md) */
          size?: "sm" | "md" | "lg";
          href?: string;
      };

export type AboutSectionData = {
    id: string;
    headline?: string;
    blocks: ContentBlock[];
};

export type TimelineEvent = {
    id: string;
    company: string;
    role?: string;
    paragraphs: InlineSpan[][];
    image: string;
    href?: string;
    color: string;
    imageSide: "left" | "right";
};
