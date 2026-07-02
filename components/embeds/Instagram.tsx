"use client";
import { useEffect, useRef, useState } from "react";
import EmbedFrame from "./EmbedFrame";

/**
 * Instagram post/reel embed via the official /embed iframe (no global embed.js).
 * Accepts either a full URL or a bare shortcode.
 *
 *   <Instagram url="https://www.instagram.com/p/ABC123/" />
 *   <Instagram url="ABC123" />
 */

function shortcodeFrom(input: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    // Bare shortcode (no slashes / dots) — accept as-is.
    if (!/[/.]/.test(trimmed)) return trimmed;
    const m = trimmed.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
}

export default function Instagram({ url, caption }: { url: string; caption?: string }) {
    const code = shortcodeFrom(url);
    const [height, setHeight] = useState(640);
    const frameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Instagram's embed iframe posts a resize message; adjust height when it does.
        // Exact-origin check — `includes` would also match evil-instagram.com etc.
        const ALLOWED_ORIGINS = ["https://www.instagram.com", "https://instagram.com"];
        function onMessage(e: MessageEvent) {
            if (!ALLOWED_ORIGINS.includes(e.origin)) return;
            try {
                const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
                const h = data?.details?.height ?? data?.height;
                if (data?.type === "MEASURE" && typeof h === "number" && h > 0) setHeight(h);
            } catch {
                /* non-JSON messages are ignored */
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    if (!code) {
        return (
            <EmbedFrame label="INSTAGRAM">
                <div
                    className="flex items-center justify-center h-24 font-mono text-xs"
                    style={{ color: "var(--error)", border: "1px solid var(--error-container)" }}
                >
                    INVALID INSTAGRAM URL: {url}
                </div>
            </EmbedFrame>
        );
    }

    return (
        <EmbedFrame label="INSTAGRAM">
            <div
                className="mx-auto border overflow-hidden"
                style={{ borderColor: "var(--outline-variant)", maxWidth: 480 }}
            >
                <iframe
                    ref={frameRef}
                    src={`https://www.instagram.com/p/${code}/embed`}
                    title={`Instagram post ${code}`}
                    loading="lazy"
                    scrolling="no"
                    allowTransparency
                    style={{ width: "100%", height, border: "none", display: "block" }}
                />
            </div>
            {caption && (
                <p className="mt-2 font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                    {caption}
                </p>
            )}
        </EmbedFrame>
    );
}
