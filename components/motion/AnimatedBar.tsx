"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
    filled: number;   // 0–10 filled blocks
    total?: number;
    color: string;
    delay?: number;
}

// Reveals the colored layer over the grey layer via clip-path — preserves ASCII feel
export default function AnimatedBar({ filled, total = 10, color, delay = 0 }: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });

    const filledChars = "█".repeat(filled);
    const emptyChars  = "░".repeat(total - filled);
    const full        = filledChars + emptyChars;

    return (
        <span ref={ref} className="relative inline-block font-mono text-xs"
              style={{ letterSpacing: "-1px" }}>
            {/* Greyed-out background layer */}
            <span style={{ color: "var(--outline-variant)" }} aria-hidden>{full}</span>
            {/* Animated color layer revealed left-to-right */}
            <motion.span
                className="absolute inset-0 overflow-hidden whitespace-pre"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={inView
                    ? { clipPath: "inset(0 0% 0 0)" }
                    : { clipPath: "inset(0 100% 0 0)" }}
                transition={{ duration: 0.75, ease: "easeOut", delay }}
                style={{ color }}
            >
                {full}
            </motion.span>
        </span>
    );
}
