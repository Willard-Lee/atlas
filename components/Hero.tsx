"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type BootLine = { prefix: string; content: string; suffix?: string };
type CtaLink  = { href: string; label: string; hoverCls: string };

// ── Constants ────────────────────────────────────────────────────────────────

const CHAR_SPEED = 18;  // ms per character typed
const LINE_PAUSE = 130; // ms between lines — simulates newline processing delay

// Three-layer shadow: near glow (18px) + far bloom (60px) + inset backlight (24px)
const PANEL_SHADOW       = "0 0 18px rgba(201,131,226,0.15), 0 0 60px rgba(201,131,226,0.06), inset 0 0 24px rgba(201,131,226,0.04)";
const PANEL_SHADOW_HOVER = "0 0 28px rgba(201,131,226,0.28), 0 0 80px rgba(201,131,226,0.12), inset 0 0 32px rgba(201,131,226,0.07)";

const bootLines: BootLine[] = [
    { prefix: ">",   content: "booting atlas.sys v2.4.1" },
    { prefix: "  ├", content: "mounting memory banks",     suffix: "[ OK ]" },
    { prefix: "  ├", content: "linking neural pathways",   suffix: "[ OK ]" },
    { prefix: "  ├", content: "indexing knowledge graph",  suffix: "[ OK ]" },
    { prefix: "  └", content: "calibrating aesthetics",    suffix: "[ OK ]" },
    { prefix: ">",   content: "user: willard_lee" },
    { prefix: ">",   content: "identity: finance × ml engineer" },
    { prefix: ">",   content: "status: actively building" },
];

const identityFields: [string, string][] = [
    ["OPERATOR", "willard_lee"],
    ["NODE",     "atlas.v2"],
    ["ARCH",     "finance × ml"],
    ["LOC",      "PHL"],
];

const systemStats = [
    { label: "FOCUS",  pct: 82,  color: "var(--primary)" },
    { label: "COFFEE", pct: 100, color: "var(--secondary-container)" },
    { label: "BUILD",  pct: 74,  color: "var(--secondary-container)" },
];

const currentlyDoing = [
    "building atlas.sys",
    "studying transformers",
    "grinding leetcode",
];

// Full class strings kept literal so Tailwind's content scanner can detect them
const ctaLinks: CtaLink[] = [
    { href: "/projects", label: "$ ./projects.sh", hoverCls: "hover:border-[var(--primary)] hover:text-[var(--primary)]" },
    { href: "/blog",     label: "$ cat ./blog",    hoverCls: "hover:border-[var(--secondary-container)] hover:text-[var(--secondary-container)]" },
    { href: "/about",    label: "$ whoami",         hoverCls: "hover:border-[var(--outline)] hover:text-[var(--on-surface)]" },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Hero() {
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);

    // Gate tagline + CTAs on isDone — revealing them while the boot sequence
    // is still printing would look broken.
    const isDone = lineIdx === bootLines.length - 1
        && charIdx >= bootLines.at(-1)!.content.length;

    // Typewriter engine: each effect tick schedules one step via setTimeout.
    // Using effect + setTimeout (not setInterval) avoids accumulating ticks
    // when renders are delayed, and cleanup is automatic on re-run.
    useEffect(() => {
        const line = bootLines[lineIdx];
        if (!line) return;

        if (charIdx < line.content.length) {
            const id = setTimeout(() => setCharIdx((c) => c + 1), CHAR_SPEED);
            return () => clearTimeout(id);
        }

        if (lineIdx < bootLines.length - 1) {
            const id = setTimeout(() => {
                setLineIdx((l) => l + 1);
                setCharIdx(0);
            }, LINE_PAUSE);
            return () => clearTimeout(id);
        }
    }, [lineIdx, charIdx]);

    return (
        <section className="dot-grid relative min-h-[94vh] px-6 md:px-16 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-0 items-center">

            {/* ── Left (3/5): title + boot sequence + CTA ─────────────────── */}
            <div
                className="lg:col-span-3 space-y-8 lg:pr-16"
            >
                <motion.h1
                    className="glow font-display text-7xl md:text-8xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    ATLAS.SYS
                </motion.h1>

                {/* Typewriter boot sequence */}
                <div className="font-mono text-xs leading-loose">
                    {bootLines.map(({ prefix, content, suffix }, i) => {
                        if (i > lineIdx) return null;

                        const isActive = i === lineIdx;
                        const isTyping = isActive && charIdx < content.length;
                        const visible  = isActive ? charIdx : content.length;

                        return (
                            <div key={content} className="flex items-center">
                                <span className="select-none w-8 shrink-0" style={{ color: "var(--outline)" }}>
                                    {prefix}
                                </span>
                                <span style={{ color: "var(--on-surface)" }}>
                                    {content.slice(0, visible)}
                                    {/* Block cursor tracks the active typing position */}
                                    {isTyping && (
                                        <span style={{ color: "var(--primary)", animation: "blink 0.6s step-end infinite" }}>
                                            ▌
                                        </span>
                                    )}
                                </span>
                                {/* Suffix ([ OK ]) only appears after the line finishes typing */}
                                {suffix && !isTyping && (
                                    <span className="ml-auto pl-4 shrink-0" style={{ color: "var(--secondary-container)" }}>
                                        {suffix}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    {isDone && (
                        <span
                            className="ml-8"
                            style={{ color: "var(--primary)", animation: "blink 1s step-end infinite" }}
                        >
                            _
                        </span>
                    )}
                </div>

                {/* Tagline + CTAs — only mount after the boot sequence finishes */}
                {isDone && (
                    <>
                        <motion.p
                            className="font-sans text-base max-w-md leading-relaxed"
                            style={{ color: "var(--on-surface-variant)" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Somewhere between financial model and a neural network, that is where I live.
                        </motion.p>

                        <motion.div
                            className="flex gap-3 flex-wrap"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.4 }}
                        >
                            {ctaLinks.map(({ href, label, hoverCls }) => (
                                <motion.div
                                    key={href}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Link
                                        href={href}
                                        className={`font-mono text-xs px-4 py-2 border transition-all duration-200 ${hoverCls}`}
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}
                                    >
                                        {label}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>

            {/* ── Right (2/5): SYSTEM.STATUS terminal panel ────────────────── */}
            <motion.div
                className="lg:col-span-2 lg:ml-12 font-mono text-xs scannable"
                style={{ border: "1px solid var(--primary)", boxShadow: PANEL_SHADOW }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ boxShadow: PANEL_SHADOW_HOVER, y: -3, transition: { duration: 0.2 } }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
                {/* Panel titlebar */}
                <div
                    className="flex items-center gap-2 px-4 py-2 border-b"
                    style={{ borderColor: "rgba(201,131,226,0.25)", background: "var(--surface-container)" }}
                >
                    <span style={{ color: "var(--primary)" }}>■</span>
                    <span style={{ color: "var(--on-surface-variant)" }}>SYSTEM.STATUS</span>
                    {/* Breathing opacity simulates a live heartbeat indicator */}
                    <motion.span
                        className="ml-auto"
                        style={{ color: "var(--secondary-container)" }}
                        animate={{ opacity: [1, 0.35, 1] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                    >
                        ● ONLINE
                    </motion.span>
                </div>

                <div className="p-4 space-y-3" style={{ background: "#08080f" }}>
                    {identityFields.map(([k, v]) => (
                        <div key={k} className="flex gap-3">
                            <span className="w-16 shrink-0" style={{ color: "var(--on-surface-variant)" }}>{k}</span>
                            <span style={{ color: "var(--on-surface)" }}>{v}</span>
                        </div>
                    ))}

                    {/* ASCII stat bars — 10-block scale, each block = 10% */}
                    <div className="border-t pt-3 space-y-2" style={{ borderColor: "var(--outline-variant)" }}>
                        {systemStats.map(({ label, pct, color }) => {
                            const filled = Math.round(pct / 10);
                            return (
                                <div key={label}>
                                    <div className="flex justify-between mb-0.5">
                                        <span style={{ color: "var(--on-surface-variant)" }}>{label}</span>
                                        <span style={{ color }}>{pct}%</span>
                                    </div>
                                    <div style={{ letterSpacing: "-1px" }}>
                                        <span style={{ color }}>{"█".repeat(filled)}</span>
                                        <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(10 - filled)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t pt-3" style={{ borderColor: "var(--outline-variant)" }}>
                        <div className="mb-1.5" style={{ color: "var(--on-surface-variant)" }}>CURRENTLY</div>
                        {currentlyDoing.map((item) => (
                            <div key={item} className="flex gap-2">
                                <span style={{ color: "var(--outline)" }}>↳</span>
                                <span style={{ color: "var(--on-surface)" }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Scroll indicator ─────────────────────────────────────────── */}
            {/* Wrapper handles centering — Framer's y-animation on the inner div
                would conflict with CSS translateX if both were on the same element */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <motion.div
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.6 }}
                >
                    <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                        scroll
                    </span>
                    <motion.span
                        style={{ color: "var(--outline)" }}
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    >
                        ↓
                    </motion.span>
                </motion.div>
            </div>

        </section>
    );
}
