import EmbedFrame from "./EmbedFrame";

/**
 * A themed "reference" card for any external link. Static props (no scraping)
 * so it stays SSR-safe and deterministic.
 *
 *   <LinkCard href="https://arxiv.org/abs/1810.04805"
 *             title="BERT: Pre-training of Deep Bidirectional Transformers"
 *             source="arXiv"
 *             description="Devlin et al., 2019" />
 */

function domainOf(href: string): string {
    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return href;
    }
}

// Only allow web/mail links — blocks javascript:, data:, etc.
function isSafeHref(href: string): boolean {
    try {
        return ["http:", "https:", "mailto:"].includes(new URL(href).protocol);
    } catch {
        return false;
    }
}

export default function LinkCard({
    href,
    title,
    source,
    description,
}: {
    href: string;
    title?: string;
    source?: string;
    description?: string;
}) {
    if (!isSafeHref(href)) {
        return (
            <EmbedFrame label="REFERENCE">
                <div className="flex items-center justify-center h-16 font-mono text-xs"
                    style={{ color: "var(--error)", border: "1px solid var(--error-container)" }}>
                    UNSAFE LINK BLOCKED: {href}
                </div>
            </EmbedFrame>
        );
    }

    const domain = domainOf(href);
    const label = source ?? domain;
    const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

    return (
        <EmbedFrame label="REFERENCE">
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-stretch gap-0 border no-underline transition-colors"
                style={{ borderColor: "var(--outline-variant)" }}
            >
                <div
                    className="flex items-center justify-center px-4 shrink-0"
                    style={{ background: "var(--surface-container)", borderRight: "1px solid var(--outline-variant)" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={favicon} alt="" width={24} height={24} loading="lazy" />
                </div>
                <div className="flex-1 min-w-0 px-4 py-3">
                    <div
                        className="font-medium truncate"
                        style={{ color: "var(--on-surface)", fontFamily: "var(--reader-font, var(--font-sans))" }}
                    >
                        {title ?? domain}
                    </div>
                    {description && (
                        <div className="text-sm truncate mt-0.5" style={{ color: "var(--on-surface-variant)" }}>
                            {description}
                        </div>
                    )}
                    <div
                        className="font-mono text-xs mt-1.5 tracking-wider truncate"
                        style={{ color: "var(--outline)" }}
                    >
                        {label} ↗
                    </div>
                </div>
            </a>
        </EmbedFrame>
    );
}
