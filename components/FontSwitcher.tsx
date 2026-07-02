"use client";
import { useState, useEffect } from "react";

type FontId = "sans" | "serif" | "mono";

const FONTS: { id: FontId; label: string; family: string; size: string; weight: number; italic?: boolean; scale?: string }[] = [
    { id: "sans",  label: "SANS",  family: "var(--font-dm-sans)",        size: "1.25rem", weight: 400 },
    { id: "serif", label: "SERIF", family: "var(--font-cormorant)",      size: "1.7rem",  weight: 400, italic: true, scale: "1.18" },
    { id: "mono",  label: "MONO",  family: "var(--font-jetbrains-mono)", size: "1.0rem",  weight: 400 },
];

const STORAGE_KEY = "atlas-reader-font";

export default function FontSwitcher() {
    const [active, setActive] = useState<FontId>("sans");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as FontId | null;
        if (stored && FONTS.some(f => f.id === stored)) {
            const match = FONTS.find(f => f.id === stored)!;
            setActive(stored);
            document.documentElement.style.setProperty("--reader-font",        match.family);
            document.documentElement.style.setProperty("--reader-font-scale",  match.scale ?? "1");
            document.documentElement.style.setProperty("--reader-font-weight", String(match.weight));
            document.documentElement.dataset.readerFont = match.id;
        }
    }, []);

    function pick(f: (typeof FONTS)[number]) {
        setActive(f.id);
        localStorage.setItem(STORAGE_KEY, f.id);
        document.documentElement.style.setProperty("--reader-font",        f.family);
        document.documentElement.style.setProperty("--reader-font-scale",  f.scale ?? "1");
        document.documentElement.style.setProperty("--reader-font-weight", String(f.weight));
        document.documentElement.dataset.readerFont = f.id;
    }

    return (
        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
            <div
                className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}
            >
                [ READER.FONT ]
            </div>
            <div className="flex">
                {FONTS.map((f, i) => {
                    const on = active === f.id;
                    return (
                        <button
                            key={f.id}
                            onClick={() => pick(f)}
                            className="flex-1 flex flex-col items-center gap-2 py-3 transition-colors"
                            style={{
                                borderRight:    i < FONTS.length - 1 ? "1px solid var(--outline-variant)" : undefined,
                                borderTop:      on ? "2px solid var(--primary)" : "2px solid transparent",
                                background:     on ? "rgba(98,0,170,0.06)" : "transparent",
                            }}
                        >
                            <span style={{
                                fontFamily: f.family,
                                fontSize:   f.size,
                                fontStyle:  f.italic ? "italic" : "normal",
                                fontWeight: f.weight,
                                lineHeight:  1,
                                color:       on ? "var(--primary)" : "var(--on-surface-variant)",
                                transition:  "color 0.15s",
                            }}>
                                Ag
                            </span>
                            <span className="font-mono" style={{
                                fontSize:     "0.58rem",
                                letterSpacing: "0.1em",
                                color:         on ? "var(--primary)" : "var(--outline)",
                                transition:    "color 0.15s",
                            }}>
                                {f.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
