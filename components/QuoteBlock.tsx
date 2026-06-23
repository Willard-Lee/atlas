"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Quote = { text: string; author: string; source: string };

const FALLBACK: Quote[] = [
    { text: "The impediment to action advances action. What stands in the way becomes the way.",                     author: "Marcus Aurelius", source: "Meditations, V" },
    { text: "Waste no more time arguing about what a good man should be. Be one.",                                   author: "Marcus Aurelius", source: "Meditations, X" },
    { text: "You have power over your mind, not outside events. Realize this, and you will find strength.",          author: "Marcus Aurelius", source: "Meditations, VI" },
    { text: "Begin at once to live, and count each separate day as a separate life.",                                author: "Seneca",          source: "Letters to Lucilius, XXII" },
    { text: "While we postpone, life speeds by.",                                                                    author: "Seneca",          source: "On the Shortness of Life" },
    { text: "All things belong to others; time alone is ours.",                                                     author: "Seneca",          source: "Letters to Lucilius, I" },
    { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "Dostoevsky",      source: "The Brothers Karamazov" },
    { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.",                   author: "Dostoevsky",      source: "Crime and Punishment" },
    { text: "Above all, don't lie to yourself.",                                                                    author: "Dostoevsky",      source: "The Brothers Karamazov" },
    { text: "If it is not right, do not do it; if it is not true, do not say it.",                                  author: "Marcus Aurelius", source: "Meditations, XII" },
];

function getDailyQuote(): Quote {
    return FALLBACK[Math.floor(Date.now() / 86_400_000) % FALLBACK.length];
}

function useTypewriter(text: string, active: boolean, resetKey: unknown, speed = 18) {
    const [cursor, setCursor] = useState(0);
    useEffect(() => { setCursor(0); }, [resetKey]);
    useEffect(() => {
        if (!active) { setCursor(0); return; }
        if (cursor >= text.length) return;
        const id = setTimeout(() => setCursor(c => c + 1), speed);
        return () => clearTimeout(id);
    }, [active, cursor, text, speed]);
    return { display: text.slice(0, cursor), done: cursor >= text.length };
}

export default function QuoteBlock() {
    const [open,         setOpen]         = useState(false);
    const [typing,       setTyping]       = useState(false);
    const [currentQuote, setCurrentQuote] = useState<Quote>(getDailyQuote);
    const [refreshKey,   setRefreshKey]   = useState(0);
    const [loading,      setLoading]      = useState(false);
    const [btnHovered,   setBtnHovered]   = useState(false);
    const [fallbackIdx,  setFallbackIdx]  = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 2500);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => setTyping(true), 320);
            return () => clearTimeout(t);
        } else {
            setTyping(false);
        }
    }, [open]);

    async function refresh() {
        setTyping(false);
        setLoading(true);
        try {
            const res = await fetch(
                "https://api.quotable.io/random?tags=technology|science|mathematics|philosophy"
            );
            if (!res.ok) throw new Error();
            const item = await res.json();
            setCurrentQuote({
                text:   item.content,
                author: item.author,
                source: (item.tags as string[])?.[0] ?? "",
            });
        } catch {
            setFallbackIdx(i => {
                const next = (i + 1) % FALLBACK.length;
                setCurrentQuote(FALLBACK[next]);
                return next;
            });
        } finally {
            setLoading(false);
            setRefreshKey(k => k + 1);
            setTimeout(() => setTyping(true), 140);
        }
    }

    const quote = currentQuote;
    const { display, done } = useTypewriter(quote.text, typing, refreshKey);

    return (
        <>
            {/* ── Reopen button — above BackToTop ─────────────────────────────── */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        key="quote-reopen"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        onClick={() => setOpen(true)}
                        onHoverStart={() => setBtnHovered(true)}
                        onHoverEnd={() => setBtnHovered(false)}
                        whileTap={{ scale: 0.93 }}
                        aria-label="Open daily quote"
                        className="fixed z-40 font-mono text-xs px-3 py-2 border
                                   bottom-[116px] lg:bottom-[72px] right-4 lg:right-8
                                   flex items-center gap-2 transition-colors"
                        style={{
                            borderColor: btnHovered ? "var(--primary)" : "var(--outline-variant)",
                            color:       btnHovered ? "var(--primary)" : "var(--outline)",
                            background:  "var(--surface-container)",
                        }}
                    >
                        <motion.span
                            animate={
                                btnHovered
                                    ? { x: [0, 4, 0, 4, 0], opacity: 1 }
                                    : { x: 0, opacity: [0.45, 1, 0.45] }
                            }
                            transition={
                                btnHovered
                                    ? { duration: 0.45, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }
                                    : { duration: 2.4, ease: "easeInOut", repeat: Infinity }
                            }
                            style={{ color: "var(--primary)" }}
                        >
                            ▶
                        </motion.span>
                        LOG
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Terminal window ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        dragElastic={0}
                        className="fixed z-30 select-none overflow-hidden"
                        style={{
                            bottom:    88,
                            right:     24,
                            width:     "min(440px, calc(100vw - 48px))",
                            border:    "1px solid var(--primary)",
                            boxShadow: "0 0 40px rgba(98,0,170,0.15), 0 0 100px rgba(98,0,170,0.06)",
                            cursor:    "grab",
                            background: "#08080f",
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{    opacity: 0, y: 14, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        whileDrag={{ cursor: "grabbing" }}
                    >
                        {/* ── Title bar ──────────────────────────────────────── */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 border-b font-mono text-xs"
                            style={{ borderColor: "rgba(98,0,170,0.3)", background: "rgba(255,255,255,0.03)" }}
                        >
                            <button
                                aria-label="Close"
                                onClick={() => setOpen(false)}
                                className="w-3 h-3 flex-shrink-0 transition-opacity hover:opacity-75"
                                style={{ background: "#ff5f57", cursor: "pointer" }}
                            />
                            <span className="w-3 h-3 flex-shrink-0" style={{ background: "#febc2e" }} />
                            <span className="w-3 h-3 flex-shrink-0" style={{ background: "#28c840" }} />

                            <span className="ml-2 tracking-widest truncate" style={{ color: "var(--outline)" }}>
                                signal_log
                            </span>

                            <div className="ml-auto flex items-center gap-3 shrink-0">
                                <motion.button
                                    aria-label="Next quote"
                                    onClick={(e) => { e.stopPropagation(); if (!loading) refresh(); }}
                                    animate={loading ? { rotate: 360 } : { rotate: 0 }}
                                    whileHover={loading ? {} : { rotate: 180, color: "var(--primary)" }}
                                    whileTap={{ scale: 0.8 }}
                                    transition={loading
                                        ? { repeat: Infinity, duration: 0.6, ease: "linear" }
                                        : { duration: 0.28 }
                                    }
                                    style={{ color: loading ? "var(--primary)" : "var(--outline)", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1 }}
                                >
                                    ↻
                                </motion.button>
                                <motion.span
                                    className="tracking-widest"
                                    style={{ color: "var(--secondary-container)" }}
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.2 }}
                                >
                                    ● LIVE
                                </motion.span>
                            </div>
                        </div>

                        {/* ── Quote body ─────────────────────────────────────── */}
                        <div className="relative px-7 pt-8 pb-6">

                            {/* Faint oversized opening mark */}
                            <div
                                aria-hidden
                                className="absolute top-3 left-4 pointer-events-none leading-none"
                                style={{
                                    fontFamily: "var(--font-cormorant)",
                                    fontSize:   "7rem",
                                    color:      "var(--primary)",
                                    opacity:    0.06,
                                    lineHeight: 1,
                                    userSelect: "none",
                                }}
                            >
                                &ldquo;
                            </div>

                            {/* Quote text — Cormorant Garamond italic */}
                            <p
                                style={{
                                    fontFamily:  "var(--font-cormorant)",
                                    fontSize:    "1.3rem",
                                    fontStyle:   "italic",
                                    fontWeight:  300,
                                    lineHeight:  1.7,
                                    color:       "var(--on-surface)",
                                    letterSpacing: "0.01em",
                                    position:    "relative",
                                }}
                            >
                                {display}
                                {!done && (
                                    <motion.span
                                        style={{
                                            fontFamily:  "var(--font-jetbrains-mono)",
                                            fontStyle:   "normal",
                                            fontSize:    "0.8rem",
                                            color:       "var(--primary)",
                                            verticalAlign: "middle",
                                        }}
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.65 }}
                                    >
                                        ▌
                                    </motion.span>
                                )}
                            </p>

                            {/* Attribution — fades in after typewriter finishes */}
                            <AnimatePresence>
                                {done && (
                                    <motion.div
                                        className="mt-5 pt-4 border-t"
                                        style={{ borderColor: "rgba(98,0,170,0.18)" }}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                    >
                                        <div className="flex items-baseline gap-0 flex-wrap">
                                            <span
                                                style={{
                                                    fontFamily:  "var(--font-cormorant)",
                                                    fontSize:    "1.05rem",
                                                    fontStyle:   "normal",
                                                    fontWeight:  500,
                                                    color:       "var(--secondary-container)",
                                                    letterSpacing: "0.04em",
                                                    textTransform: "uppercase" as const,
                                                    marginRight: "0.6rem",
                                                }}
                                            >
                                                {quote.author}
                                            </span>
                                            <span
                                                className="font-mono"
                                                style={{
                                                    fontSize:    "0.65rem",
                                                    color:       "var(--outline)",
                                                    letterSpacing: "0.08em",
                                                    alignSelf:   "center",
                                                }}
                                            >
                                                ·  {quote.source}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
