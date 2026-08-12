import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AppLinkProps = {
    href: string;
    className?: string;
    children: ReactNode;
};

const SITE_HOSTS = new Set(["asklumie.me", "www.asklumie.me"]);

function getInternalPath(href: string): string | null {
    if (href.startsWith("/") && !href.startsWith("//")) {
        return href;
    }

    try {
        const url = new URL(href, window.location.origin);
        if (url.host === window.location.host || SITE_HOSTS.has(url.host)) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        return null;
    }

    return null;
}

/** Same-tab SPA navigation for internal pages; new tab only for off-site URLs. */
export default function AppLink({ href, className, children }: AppLinkProps) {
    const internalPath = getInternalPath(href);

    if (internalPath) {
        return (
            <Link to={internalPath} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    );
}
