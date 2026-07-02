import EmbedFrame from "./EmbedFrame";

// Only allow http(s) iframe sources — blocks javascript:, data:, etc.
function isSafeSrc(src: string): boolean {
    try {
        return ["http:", "https:"].includes(new URL(src).protocol);
    } catch {
        return false;
    }
}

/**
 * Generic responsive iframe embed for anything not covered by a dedicated
 * component (maps, Spotify, CodePen, etc.).
 *
 *   <Embed src="https://open.spotify.com/embed/track/..." ratio="1/1" />
 *   <Embed src="https://www.youtube.com/embed/..." />
 */
export default function Embed({
    src,
    ratio = "16/9",
    title = "Embedded content",
    label = "EMBED",
}: {
    src: string;
    ratio?: string;
    title?: string;
    label?: string;
}) {
    if (!isSafeSrc(src)) {
        return (
            <EmbedFrame label={label}>
                <div className="flex items-center justify-center h-16 font-mono text-xs"
                    style={{ color: "var(--error)", border: "1px solid var(--error-container)" }}>
                    UNSAFE EMBED BLOCKED: {src}
                </div>
            </EmbedFrame>
        );
    }

    return (
        <EmbedFrame label={label}>
            <div
                className="w-full border overflow-hidden"
                style={{ borderColor: "var(--outline-variant)", aspectRatio: ratio }}
            >
                <iframe
                    src={src}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
            </div>
        </EmbedFrame>
    );
}
