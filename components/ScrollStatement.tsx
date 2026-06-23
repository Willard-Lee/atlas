"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// The sentence is longer than the viewport — keywords are revealed as you scroll
const SEGMENTS = [
    { text: "somewhere between a ",                          accent: false },
    { text: "financial model",                               accent: true  },
    { text: " and a ",                                       accent: false },
    { text: "neural net",                                    accent: true  },
    { text: " — building things that ",                      accent: false },
    { text: "think",                                         accent: true  },
    { text: ", crash gracefully, and occasionally ",         accent: false },
    { text: "ship on time",                                  accent: true  },
    { text: " ——  ATLAS.SYS  //  ",                         accent: false },
    { text: "perpetual beta",                                accent: true  },
    { text: "  //  always building  //",                     accent: false },
] as const;

export default function ScrollStatement() {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Drifts left as the element travels through the viewport
    const x = useTransform(scrollYProgress, [0, 1], ["18%", "-48%"]);

    return (
        <div
            ref={ref}
            className="overflow-hidden py-8 border-t border-b"
            style={{
                borderColor: "var(--outline-variant)",
                // Fade the left and right edges so the text feels infinite
                maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
        >
            <motion.p
                style={{ x, whiteSpace: "nowrap" }}
                className="font-display font-bold select-none leading-none"
            >
                {SEGMENTS.map(({ text, accent }, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: "clamp(1.9rem, 3.8vw, 3.2rem)",
                            color: accent ? "var(--primary)" : "var(--on-surface)",
                            opacity: accent ? 1 : 0.55,
                        }}
                    >
                        {text}
                    </span>
                ))}
            </motion.p>
        </div>
    );
}
