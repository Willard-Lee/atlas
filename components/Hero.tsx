"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Glitch reveal (SSR-safe: starts with real text, scrambles on mount) ──────

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%^─│┼░▒▓■□◈⬡◉▶▣╔╗╚╝";

function useGlitchReveal(text: string, delay = 0) {
    const [display, setDisplay] = useState(text); // real text on server

    useEffect(() => {
        let iter = 0;
        let intervalId: ReturnType<typeof setInterval>;

        const timeoutId = setTimeout(() => {
            // flash to glitched immediately then resolve
            setDisplay(
                text.split("").map(ch =>
                    ch === " " || ch === "." ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                ).join("")
            );

            intervalId = setInterval(() => {
                setDisplay(
                    text.split("").map((ch, i) => {
                        if (ch === " " || ch === ".") return ch;
                        if (i < iter) return text[i];
                        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    }).join("")
                );
                iter += 0.5;
                if (iter >= text.length) {
                    setDisplay(text);
                    clearInterval(intervalId);
                }
            }, 38);
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [text, delay]);

    return display;
}

// ── Role Cycler ──────────────────────────────────────────────────────────────

const ROLES = [
    "Finance Engineer.",
    "ML Practitioner.",
    "Builder of Things.",
    "3AM Committer.",
    "Perpetual Beta.",
];

function RoleCycler() {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % ROLES.length), 2800);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="h-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.span
                    key={idx}
                    className="font-mono text-sm tracking-wider absolute whitespace-nowrap"
                    style={{ color: "var(--secondary-container)" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    {ROLES[idx]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

// ── Constants ────────────────────────────────────────────────────────────────

const IDENTITY: [string, string][] = [
    ["OPERATOR", "willard_lee"],
    ["NODE",     "atlas.v1"],
    ["ARCH",     "finance × ml"],
    ["LOC",      "PHL"],
];

const SYSTEM_STATS = [
    { label: "FOCUS",  pct: 82,  color: "var(--primary)" },
    { label: "COFFEE", pct: 100, color: "var(--secondary-container)" },
    { label: "BUILD",  pct: 74,  color: "var(--secondary-container)" },
];

const CURRENT = ["building atlas.sys", "studying transformers", "grinding leetcode"];

const CTAS = [
    { href: "/projects", label: "$ ./projects.sh", hover: "hover:border-[var(--primary)] hover:text-[var(--primary)]" },
    { href: "/blog",     label: "$ cat ./blog",    hover: "hover:border-[var(--secondary-container)] hover:text-[var(--secondary-container)]" },
    { href: "/about",    label: "$ whoami",         hover: "hover:border-[var(--outline)] hover:text-[var(--on-surface)]" },
] as const;

const STATS = [
    { key: "LOC",    val: "PHL / MYS",     color: "var(--on-surface-variant)" },
    { key: "ARCH",   val: "finance × ml",  color: "var(--on-surface-variant)" },
    { key: "STATUS", val: "● BUILDING",    color: "#4ade80" },
    { key: "VER",    val: "v1.1.0",        color: "var(--primary)" },
] as const;

const PANEL_SHADOW       = "0 0 18px rgba(98,0,170,0.10), 0 0 60px rgba(98,0,170,0.04), inset 0 0 24px rgba(98,0,170,0.03)";
const PANEL_SHADOW_HOVER = "0 0 28px rgba(98,0,170,0.20), 0 0 80px rgba(98,0,170,0.09), inset 0 0 32px rgba(98,0,170,0.06)";

// ── Component ────────────────────────────────────────────────────────────────

export default function Hero() {
    const nameFirst = useGlitchReveal("WILLARD", 120);
    const nameLast  = useGlitchReveal("LEE.",    360);

    return (
        <section className="dot-grid relative min-h-[92vh] flex items-center px-6 md:px-16 py-16">

            {/* Radial glow — violet wash behind the name */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 65% 60% at 28% 50%, rgba(98,0,170,0.07) 0%, transparent 68%)",
                }}
            />

            <div className="relative w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-0 items-center">

                {/* ── LEFT: Identity ─────────────────────────────────────── */}
                <div className="lg:col-span-3 space-y-7 lg:pr-16">

                    {/* Eyebrow — system identifier */}
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span
                            className="font-mono text-xs"
                            style={{ color: "var(--secondary-container)", animation: "blink 1.5s step-end infinite" }}
                        >
                            ■
                        </span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            ATLAS.SYS // v1.1.0 // signal acquired
                        </span>
                    </motion.div>

                    {/* Name — glitch decrypt reveal */}
                    <div className="space-y-0">
                        <motion.h1
                            className="glow font-display font-bold tracking-tight leading-[0.95] select-none"
                            style={{ fontSize: "clamp(3rem, 8.5vw, 6rem)" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.05, delay: 0.08 }}
                        >
                            {nameFirst}
                        </motion.h1>
                        <motion.h1
                            className="font-display font-bold tracking-tight leading-[0.95] select-none"
                            style={{
                                fontSize: "clamp(3rem, 8.5vw, 6rem)",
                                color: "var(--on-surface)",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.05, delay: 0.3 }}
                        >
                            {nameLast}
                        </motion.h1>
                    </div>

                    {/* Role cycler */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                    >
                        <p className="font-mono text-xs mb-2 tracking-widest" style={{ color: "var(--outline)" }}>
                            CURRENTLY IDENTIFIED AS
                        </p>
                        <RoleCycler />
                    </motion.div>

                    {/* Tagline */}
                    <motion.p
                        className="font-sans text-base max-w-md leading-relaxed"
                        style={{ color: "var(--on-surface-variant)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        Somewhere between a financial model and a neural network — that&apos;s where I live.
                        Building things that think, visualize, and occasionally crash gracefully.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex gap-3 flex-wrap"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.85, duration: 0.4 }}
                    >
                        {CTAS.map(({ href, label, hover }) => (
                            <motion.div
                                key={href}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Link
                                    href={href}
                                    className={`font-mono text-xs px-4 py-2 border transition-all duration-200 ${hover}`}
                                    style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}
                                >
                                    {label}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Quick stats strip */}
                    <motion.div
                        className="flex flex-wrap gap-x-6 gap-y-1.5 pt-5 border-t font-mono text-xs"
                        style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                    >
                        {STATS.map(({ key, val, color }) => (
                            <span key={key}>
                                {key}&nbsp;<span style={{ color }}>{val}</span>
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* ── RIGHT: SYSTEM.STATUS terminal panel ────────────────── */}
                <motion.div
                    className="lg:col-span-2 lg:ml-12 font-mono text-xs"
                    style={{ border: "1px solid var(--primary)", boxShadow: PANEL_SHADOW }}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ boxShadow: PANEL_SHADOW_HOVER, y: -3, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
                >
                    {/* Titlebar */}
                    <div
                        className="flex items-center gap-2 px-4 py-2 border-b"
                        style={{ borderColor: "rgba(98,0,170,0.2)", background: "var(--surface-container)" }}
                    >
                        <span style={{ color: "var(--primary)" }}>■</span>
                        <span style={{ color: "var(--on-surface-variant)" }}>SYSTEM.STATUS</span>
                        <motion.span
                            className="ml-auto"
                            style={{ color: "var(--secondary-container)" }}
                            animate={{ opacity: [1, 0.35, 1] }}
                            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                        >
                            ● ONLINE
                        </motion.span>
                    </div>

                    {/* Panel body */}
                    <div className="p-4 space-y-3" style={{ background: "#08080f" }}>
                        {/* Identity fields */}
                        {IDENTITY.map(([k, v]) => (
                            <div key={k} className="flex gap-3">
                                <span className="w-16 shrink-0" style={{ color: "var(--on-surface-variant)" }}>{k}</span>
                                <span style={{ color: "var(--on-surface)" }}>{v}</span>
                            </div>
                        ))}

                        {/* Stat bars */}
                        <div className="border-t pt-3 space-y-2" style={{ borderColor: "var(--outline-variant)" }}>
                            {SYSTEM_STATS.map(({ label, pct, color }) => {
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

                        {/* Currently */}
                        <div className="border-t pt-3" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="mb-1.5" style={{ color: "var(--on-surface-variant)" }}>CURRENTLY</div>
                            {CURRENT.map(item => (
                                <div key={item} className="flex gap-2">
                                    <span style={{ color: "var(--outline)" }}>↳</span>
                                    <span style={{ color: "var(--on-surface)" }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <motion.div
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                >
                    <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>scroll</span>
                    <motion.span
                        style={{ color: "var(--outline)" }}
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    >↓</motion.span>
                </motion.div>
            </div>
        </section>
    );
}
