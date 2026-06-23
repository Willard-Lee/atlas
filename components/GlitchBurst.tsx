"use client";
import { useRef, useState, useEffect } from "react";
import { useInView, motion } from "framer-motion";

const NOISE_CHARS = "▓▒░█│─┼╔╗╚╝◈⬡◉▶▣■□░▒▓│─╔╗░█";
const ROWS = 3;
const COLS = 180; // overwide — overflow:hidden clips the rest

export default function GlitchBurst() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20px" });

    // Generated client-side to avoid server/client hydration mismatch
    const [noise,   setNoise]   = useState<string[]>([]);
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        setNoise(
            Array.from({ length: ROWS }, () =>
                Array.from({ length: COLS }, () =>
                    NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]
                ).join("")
            )
        );
    }, []);

    return (
        <div
            ref={ref}
            className="relative overflow-hidden border-t border-b"
            style={{ borderColor: "var(--outline-variant)" }}
        >
            {/* ── Noise panel ─────────────────────────────────────────────── */}
            {!cleared && (
                <div style={{ background: "#08080f", minHeight: "3.75rem" }}>
                    {noise.map((row, i) => (
                        <div
                            key={i}
                            className="font-mono text-xs leading-none px-4 py-1.5 overflow-hidden whitespace-nowrap select-none"
                            style={{ color: "var(--outline-variant)" }}
                        >
                            {row}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Cleared state ───────────────────────────────────────────── */}
            {cleared && (
                <div
                    className="flex items-center gap-3 px-6 md:px-16 py-3 font-mono text-xs"
                    style={{ color: "var(--outline)", background: "var(--surface-container-lowest)" }}
                >
                    <span style={{ color: "var(--secondary-container)" }}>▶</span>
                    SIGNAL CLEAR — proceeding to builds
                    <motion.span
                        style={{ color: "var(--outline-variant)" }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                    >
                        ▌
                    </motion.span>
                </div>
            )}

            {/* ── Wiper — sweeps L→R when inView, covering the noise ──────── */}
            {!cleared && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:      "var(--surface-container-lowest)",
                        transformOrigin: "left center",
                    }}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : undefined}
                    transition={{ duration: 1.3, ease: [0.77, 0, 0.18, 1], delay: 0.1 }}
                    onAnimationComplete={() => {
                        if (inView) setCleared(true);
                    }}
                />
            )}
        </div>
    );
}
