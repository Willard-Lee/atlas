"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

// ── Scramble engine ──────────────────────────────────────────────────────────
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^─│┼░▒▓■□◈⬡◉▶▣╔╗╚╝";

function useScramble(text: string) {
    const [display, setDisplay] = useState(text);
    const raf = useRef<number>(0);

    const scramble = useCallback(() => {
        cancelAnimationFrame(raf.current);
        let iter = 0;
        const tick = () => {
            setDisplay(
                text.split("").map((ch, i) => {
                    if (" ._:/".includes(ch)) return ch;
                    if (i < iter) return text[i];
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }).join("")
            );
            iter += 2;
            if (iter < text.length) {
                raf.current = requestAnimationFrame(tick);
            } else {
                setDisplay(text);
            }
        };
        raf.current = requestAnimationFrame(tick);
    }, [text]);

    useEffect(() => () => cancelAnimationFrame(raf.current), []);
    return { display, scramble };
}

// ── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
    {
        cmd:         "$ whoami --no-censor",
        route:       "/about",
        label:       "ABOUT.EXE",
        tag:         "PID:1337",
        status:      "RUNNING",
        statusColor: "var(--secondary-container)",
        ascii:       "◈",
        color:       "var(--primary)",
        headline:    "A function that returns too much.",
        desc:        "Contains: finance × ML, dangerously high caffeine dependency, intermittent 3AM commits, and a brain that models everything as a latent space problem.",
        warning:     "WARNING: High recursion depth. May not terminate.",
        cta:         "LOAD PROCESS",
    },
    {
        cmd:         "$ ls ./projects --sort=entropy",
        route:       "/projects",
        label:       "BUILD.MANIFEST",
        tag:         "PID:2048",
        status:      "BUILDING",
        statusColor: "#facc15",
        ascii:       "⬡",
        color:       "var(--secondary-container)",
        headline:    "The graveyard and the gallery. Same address.",
        desc:        "Some ship to production. Some ship to /dev/null. The line is intentionally blurry. Enter if you accept undefined behavior and abandoned prototypes.",
        warning:     "WARNING: May contain spaghetti and hubris.",
        cta:         "OPEN MANIFEST",
    },
    {
        cmd:         "$ cat ./blog | grep -v 'TODO'",
        route:       "/blog",
        label:       "TRANSMISSION_LOG",
        tag:         "PID:0x1F4",
        status:      "● LIVE",
        statusColor: "#4ade80",
        ascii:       "▶",
        color:       "var(--primary)",
        headline:    "Raw neural output. Compressed to markdown.",
        desc:        "Side effects may include: sudden architecture rewrites, irrational urge to learn Haskell, and deep distrust of every data structure you've ever trusted.",
        warning:     "WARNING: Opinionated. Not peer-reviewed.",
        cta:         "TUNE IN",
    },
    {
        cmd:         "$ find ./garden -type haunted",
        route:       "/garden",
        label:       "LATENT.NODES",
        tag:         "PID:404",
        status:      "GROWING",
        statusColor: "#4ade80",
        ascii:       "◉",
        color:       "#4ade80",
        headline:    "Not a blog. Not a wiki. A haunted forest.",
        desc:        "Ideas composted or grown to evergreen. Navigate at your own epistemic risk. Some nodes bite. None of them are done. That is the entire point.",
        warning:     "WARNING: Content mutates over time. No SLA.",
        cta:         "ENTER FOREST",
    },
    {
        cmd:         "$ grep -r 'enlightenment' ./library",
        route:       "/resources",
        label:       "SIGNAL.ARCHIVE",
        tag:         "PID:8080",
        status:      "INDEXED",
        statusColor: "var(--secondary-container)",
        ascii:       "▣",
        color:       "#facc15",
        headline:    "Things read, argued with, and annotated.",
        desc:        "Papers, books, datasets. Filtered through survivorship bias and whatever I was obsessed with that quarter. Some changed how I think. Some raised cortisol.",
        warning:     "WARNING: High prior-update probability.",
        cta:         "OPEN ARCHIVE",
    },
] as const;

// ── Card ─────────────────────────────────────────────────────────────────────

function SectionCard({ s, index }: { s: typeof SECTIONS[number]; index: number }) {
    const { display, scramble } = useScramble(s.label);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
        >
            <Link href={s.route} className="group block h-full" onMouseEnter={scramble}>
                <div
                    className="relative h-full flex flex-col p-5 border transition-colors duration-200"
                    style={{
                        borderColor: "var(--outline-variant)",
                        background: "var(--surface-container-low)",
                    }}
                >
                    {/* Accent line slides in on hover */}
                    <div
                        className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                        style={{ background: s.color }}
                    />

                    {/* Command + status */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="font-mono text-xs truncate" style={{ color: "var(--outline)" }}>
                            {s.cmd}
                        </span>
                        <span className="font-mono text-xs shrink-0" style={{ color: s.statusColor }}>
                            {s.status}
                        </span>
                    </div>

                    {/* Label row: ascii glyph + scrambling text + pid */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-mono text-base shrink-0" style={{ color: s.color }}>
                            {s.ascii}
                        </span>
                        <span className="font-mono text-xs font-bold tracking-widest" style={{ color: s.color }}>
                            {display}
                        </span>
                        <span
                            className="font-mono text-xs ml-auto shrink-0 px-1.5 py-0.5"
                            style={{
                                background: "var(--surface-container-high)",
                                color: "var(--on-surface-variant)",
                            }}
                        >
                            {s.tag}
                        </span>
                    </div>

                    {/* Headline */}
                    <p className="font-display text-lg font-bold leading-snug mb-2"
                       style={{ color: "var(--on-surface)" }}>
                        {s.headline}
                    </p>

                    {/* Description */}
                    <p className="font-mono text-xs leading-loose mb-3 flex-1"
                       style={{ color: "var(--on-surface-variant)" }}>
                        {s.desc}
                    </p>

                    {/* Warning */}
                    <div
                        className="font-mono text-xs mb-4 pl-2 border-l-2"
                        style={{ color: "var(--outline)", borderColor: "var(--outline-variant)" }}
                    >
                        {s.warning}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-auto">
                        <div
                            className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ background: s.color }}
                        />
                        <span
                            className="font-mono text-xs flex items-center gap-1.5 transition-all duration-200 group-hover:gap-3"
                            style={{ color: s.color }}
                        >
                            {s.cta} <span>→</span>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

const CMD_FULL = "man atlas.sys";

export default function NavigationGuide() {
    const [cmdText, setCmdText] = useState("");
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-80px" });

    useEffect(() => {
        if (!inView) return;
        let i = 0;
        const id = setInterval(() => {
            setCmdText(CMD_FULL.slice(0, i + 1));
            i++;
            if (i >= CMD_FULL.length) clearInterval(id);
        }, 75);
        return () => clearInterval(id);
    }, [inView]);

    return (
        <section
            ref={sectionRef}
            className="border-t py-20 px-6 md:px-16"
            style={{
                borderColor: "var(--outline-variant)",
                background: "var(--surface-container-lowest)",
            }}
        >
            {/* ── Man-page header ─────────────────────────────────────────── */}
            <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
            >
                {/* Prompt line */}
                <div className="font-mono text-xs mb-5 flex items-center gap-0.5"
                     style={{ color: "var(--outline)" }}>
                    <span style={{ color: "var(--secondary-container)" }}>atlas@sys</span>
                    <span>:</span>
                    <span style={{ color: "var(--primary)" }}>~</span>
                    <span>$&nbsp;</span>
                    <span style={{ color: "var(--on-surface)" }}>{cmdText}</span>
                    <span style={{ color: "var(--primary)", animation: "blink 1s step-end infinite" }}>▌</span>
                </div>

                {/* Man page chrome */}
                <div className="font-mono text-xs flex justify-between mb-1"
                     style={{ color: "var(--outline)" }}>
                    <span>ATLAS.SYS(1)</span>
                    <span className="hidden sm:block">GENERAL COMMANDS MANUAL</span>
                    <span>ATLAS.SYS(1)</span>
                </div>
                <div className="border-b mb-8" style={{ borderColor: "var(--outline-variant)" }} />

                {/* Title + live stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="font-mono text-xs tracking-widest mb-2"
                             style={{ color: "var(--on-surface-variant)" }}>
                            SECTION — NAVIGATION_PROTOCOL
                        </div>
                        <h2 className="font-display text-4xl sm:text-5xl font-bold leading-none"
                            style={{ color: "var(--on-surface)" }}>
                            HOW TO NOT
                        </h2>
                        <h2 className="font-display text-4xl sm:text-5xl font-bold leading-none glow">
                            GET LOST.
                        </h2>
                        <p className="font-mono text-xs mt-4 max-w-sm leading-loose"
                           style={{ color: "var(--on-surface-variant)" }}>
                            A field guide for atlas.sys — a portfolio OS disguised as a website. No refunds. No warranty. The author is not liable for time lost in /garden.
                        </p>
                    </div>

                    {/* Fake system stats */}
                    <div className="font-mono text-xs space-y-2 md:text-right shrink-0"
                         style={{ color: "var(--outline)" }}>
                        <div>
                            UPTIME{" "}
                            <span style={{ color: "var(--secondary-container)" }}>∞</span>
                        </div>
                        <div>
                            PROCESSES{" "}
                            <span style={{ color: "var(--primary)" }}>5 active</span>
                        </div>
                        <div>
                            CAFFEINE_LEVEL{" "}
                            <span style={{ color: "#facc15" }}>CRITICAL</span>
                        </div>
                        <div>
                            STATUS{" "}
                            <span style={{ color: "#4ade80", animation: "blink 2.5s step-end infinite" }}>
                                ● ALL SYSTEMS GO
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Cards ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SECTIONS.map((s, i) => (
                    <SectionCard key={s.route} s={s} index={i} />
                ))}
            </div>

            {/* ── Footer footnotes ─────────────────────────────────────────── */}
            <motion.div
                className="mt-8 pt-6 border-t font-mono text-xs flex flex-wrap gap-x-6 gap-y-1.5"
                style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <span>
                    <span style={{ color: "var(--primary)" }}>NOTE:</span>{" "}
                    Documentation is technically accurate but spiritually unreliable.
                </span>
                <span>
                    <span style={{ color: "var(--secondary-container)" }}>DISCLAIMER:</span>{" "}
                    Author accepts no liability for time lost in /garden.
                </span>
                <span>
                    <span style={{ color: "#facc15" }}>KNOWN BUG:</span>{" "}
                    Site always under construction. This is a feature, not a bug.
                </span>
            </motion.div>
        </section>
    );
}
