"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Each line independently travels at a different speed + direction,
// creating a shifting scanline / venetian-blind parallax as you scroll.
const LINES = [
    { top: "10%", height: 1, color: "var(--outline-variant)",     opacity: 0.9 },
    { top: "26%", height: 2, color: "var(--primary)",             opacity: 0.45 },
    { top: "40%", height: 1, color: "var(--outline)",             opacity: 0.8 },
    { top: "55%", height: 1, color: "var(--secondary-container)", opacity: 0.35 },
    { top: "68%", height: 2, color: "var(--outline-variant)",     opacity: 0.7 },
    { top: "84%", height: 1, color: "var(--primary)",             opacity: 0.25 },
] as const;

export default function ParallaxDivider() {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Hooks must be at the top level — one per line
    const x1 = useTransform(scrollYProgress, [0, 1], ["-18%",  "6%"  ]);
    const x2 = useTransform(scrollYProgress, [0, 1], ["10%",  "-24%"  ]);
    const x3 = useTransform(scrollYProgress, [0, 1], ["-6%",   "16%"  ]);
    const x4 = useTransform(scrollYProgress, [0, 1], ["14%",  "-9%"   ]);
    const x5 = useTransform(scrollYProgress, [0, 1], ["-20%",  "4%"   ]);
    const x6 = useTransform(scrollYProgress, [0, 1], ["4%",   "-14%"  ]);

    const transforms = [x1, x2, x3, x4, x5, x6];

    return (
        <div
            ref={ref}
            className="relative overflow-hidden"
            style={{
                height: 96,
                borderTop:    "1px solid var(--outline-variant)",
                borderBottom: "1px solid var(--outline-variant)",
            }}
            aria-hidden="true"
        >
            {LINES.map((line, i) => (
                <motion.div
                    key={i}
                    style={{
                        x:          transforms[i],
                        position:   "absolute",
                        top:        line.top,
                        left:       "-20%",
                        width:      "140%",
                        height:     line.height,
                        background: line.color,
                        opacity:    line.opacity,
                    }}
                />
            ))}
        </div>
    );
}
