"use client";
import { useEffect } from "react";

// Renders any <div class="mermaid"> emitted by rehypeMermaid (lib/mdx.ts) into SVG.
// Server-rendered MDX can't run mermaid (it needs the DOM), so this client component
// drives it after hydration. No-ops on pages with no .mermaid blocks.
let initialised = false;

export default function MermaidRunner() {
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const nodes = document.querySelectorAll<HTMLElement>(".mermaid:not([data-processed])");
            if (nodes.length === 0) return;

            const mermaid = (await import("mermaid")).default;
            if (cancelled) return;

            if (!initialised) {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    securityLevel: "strict",
                    fontFamily: "var(--font-mono), monospace",
                });
                initialised = true;
            }

            try {
                await mermaid.run({ nodes });
            } catch {
                // A malformed diagram shouldn't take down the page — leave its source visible.
            }
        })();

        return () => { cancelled = true; };
    }, []);

    return null;
}
