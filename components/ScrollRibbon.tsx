"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ROW1 = [
    "FINANCE", "×",
    "MACHINE LEARNING", "×",
    "SYSTEMS", "×",
    "DESIGN", "×",
    "ATLAS.SYS", "×",
    "PERPETUAL BETA", "×",
    "3AM COMMITS", "×",
];

const ROW2 = [
    "python", "··",
    "typescript", "··",
    "next.js 16", "··",
    "pytorch", "··",
    "langchain", "··",
    "fastapi", "··",
    "postgresql", "··",
    "tailwind v4", "··",
    "framer motion", "··",
    "vercel", "··",
    "r lang", "··",
];

export default function ScrollRibbon() {
    const ref = useRef<HTMLDivElement>(null);

    // Track scroll relative to this element — starts when it enters the bottom
    // of the viewport, ends when it leaves the top
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 90%", "end 10%"],
    });

    // Row 1 drifts left; row 2 drifts right
    const x1 = useTransform(scrollYProgress, [0, 1], ["4%",  "-18%"]);
    const x2 = useTransform(scrollYProgress, [0, 1], ["-12%", "6%"]);

    return (
        <div
            ref={ref}
            className="overflow-hidden py-5 border-t border-b"
            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container-lowest)" }}
            aria-hidden="true"
        >
            {/* Row 1 — large display, moves left ← */}
            <motion.div style={{ x: x1 }} className="flex items-center whitespace-nowrap mb-2.5">
                {[...ROW1, ...ROW1, ...ROW1].map((item, i) => (
                    <span
                        key={i}
                        className="font-display font-bold select-none"
                        style={{
                            fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
                            padding: "0 1rem",
                            color: item === "×" ? "var(--primary)" : "var(--on-surface)",
                            opacity: item === "×" ? 0.4 : 1,
                        }}
                    >
                        {item}
                    </span>
                ))}
            </motion.div>

            {/* Row 2 — mono small, moves right → */}
            <motion.div style={{ x: x2 }} className="flex items-center whitespace-nowrap">
                {[...ROW2, ...ROW2, ...ROW2].map((item, i) => (
                    <span
                        key={i}
                        className="font-mono text-xs tracking-widest select-none px-3"
                        style={{
                            color: item === "··" ? "var(--outline-variant)" : "var(--outline)",
                        }}
                    >
                        {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
