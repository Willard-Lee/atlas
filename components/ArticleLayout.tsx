"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FontSwitcher from "@/components/FontSwitcher";

type Heading = { id: string; text: string; level: number };

interface Props {
    children:  React.ReactNode;
    right:     React.ReactNode;
    headings?: Heading[];
}

export default function ArticleLayout({ children, right, headings = [] }: Props) {
    const [collapsed,  setCollapsed]  = useState(false);
    const [focus,      setFocus]      = useState(false);
    const [mobile,     setMobile]     = useState(false);
    const [tocHovered, setTocHovered] = useState(false);
    const [activeId,   setActiveId]   = useState("");
    const [fullscreen, setFullscreen] = useState(false);

    // Always track active heading + scroll % (not just in focus mode)
    useEffect(() => {
        const h2s = headings.filter(h => h.level === 2);

        function update() {
            let current = "";
            for (const h of h2s) {
                const el = document.getElementById(h.id);
                if (el && el.getBoundingClientRect().top <= 120) current = h.id;
            }
            setActiveId(current);
        }

        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, [headings]);

    // F key for focus mode
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement)?.tagName ?? "";
            if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
            if ((e.target as HTMLElement)?.isContentEditable) return;
            if (e.key === "f" || e.key === "F") setFocus(v => !v);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Sync focus-mode class on <html>
    useEffect(() => {
        document.documentElement.classList.toggle("focus-mode", focus);
        return () => document.documentElement.classList.remove("focus-mode");
    }, [focus]);

    // Track browser fullscreen state
    useEffect(() => {
        function onChange() { setFullscreen(!!document.fullscreenElement); }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    return (
        <div
            className="relative px-4 sm:px-10"
            style={{
                maxWidth:      "56rem",
                marginLeft:    "auto",
                marginRight:   "auto",
                paddingBottom: "8rem",
                paddingTop:    "2.5rem",
            }}
        >
            {children}

            {/* ── Floating window (desktop) ──────────────────────────── */}
            <motion.div
                animate={{ x: focus ? 320 : 0, opacity: focus ? 0 : 1 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:flex flex-col"
                style={{
                    position:      "fixed",
                    right:         24,
                    top:           80,
                    width:         256,
                    zIndex:        40,
                    background:    "var(--surface-container-low)",
                    border:        "1px solid var(--outline-variant)",
                    boxShadow:     "0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.10)",
                    pointerEvents: focus ? "none" : "auto",
                }}
            >
                {/* Title bar */}
                <div
                    className="flex items-center justify-between px-3 py-2.5 border-b shrink-0 select-none"
                    style={{ borderColor: "var(--outline-variant)", borderTop: "2px solid var(--primary)" }}
                >
                    <span className="font-mono text-xs font-bold tracking-widest" style={{ color: "var(--primary)" }}>
                        [ ARTICLE.INFO ]
                    </span>
                    <button
                        onClick={() => setCollapsed(v => !v)}
                        className="font-mono leading-none transition-opacity hover:opacity-60"
                        style={{ color: "var(--outline)", fontSize: "0.85rem" }}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? "□" : "—"}
                    </button>
                </div>

                {/* Collapsible body */}
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                        >
                            <div
                                className="p-3 space-y-3 overflow-y-auto"
                                style={{ maxHeight: "calc(100vh - 160px)", scrollbarWidth: "thin", scrollbarColor: "var(--outline-variant) transparent" }}
                            >
                                <button
                                    onClick={() => setFocus(v => !v)}
                                    className="w-full font-mono text-xs px-3 py-2.5 border flex items-center gap-2 transition-colors"
                                    style={{
                                        borderColor: focus ? "var(--primary)" : "var(--outline-variant)",
                                        color:       focus ? "var(--primary)" : "var(--on-surface-variant)",
                                        background:  focus ? "rgba(98,0,170,0.06)" : "transparent",
                                    }}
                                >
                                    <span style={{ fontSize: "0.85rem", lineHeight: 1, flexShrink: 0 }}>{focus ? "◉" : "◎"}</span>
                                    <span className="tracking-widest truncate">FOCUS.MODE</span>
                                    <span className="ml-auto font-mono shrink-0" style={{ fontSize: "0.6rem", color: focus ? "var(--primary)" : "var(--outline)" }}>
                                        {focus ? "ON" : "OFF"}
                                    </span>
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="w-full font-mono text-xs px-3 py-2.5 border flex items-center gap-2 transition-colors"
                                    style={{
                                        borderColor: fullscreen ? "var(--primary)" : "var(--outline-variant)",
                                        color:       fullscreen ? "var(--primary)" : "var(--on-surface-variant)",
                                        background:  fullscreen ? "rgba(98,0,170,0.06)" : "transparent",
                                    }}
                                >
                                    <span style={{ fontSize: "0.85rem", lineHeight: 1, flexShrink: 0 }}>⛶</span>
                                    <span className="tracking-widest truncate">FULLSCREEN</span>
                                    <span className="ml-auto font-mono shrink-0" style={{ fontSize: "0.6rem", color: fullscreen ? "var(--primary)" : "var(--outline)" }}>
                                        {fullscreen ? "ON" : "OFF"}
                                    </span>
                                </button>

                                <FontSwitcher />
                                {right}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── Mobile trigger ─────────────────────────────────────── */}
            <motion.button
                className="lg:hidden fixed right-4 z-40 font-mono text-xs px-2.5 py-1.5"
                style={{
                    bottom:        68,
                    border:        "1px solid var(--primary)",
                    color:         "var(--primary)",
                    background:    "var(--surface-container-low)",
                    boxShadow:     "0 0 12px rgba(201,131,226,0.25)",
                    letterSpacing: "0.1em",
                }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setMobile(true)}
            >
                [ INFO ]
            </motion.button>

            {/* ── Mobile bottom sheet ────────────────────────────────── */}
            <AnimatePresence>
                {mobile && (
                    <>
                        <motion.div
                            key="sheet-backdrop"
                            className="lg:hidden fixed inset-0 z-40"
                            style={{ background: "rgba(0,0,0,0.65)" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobile(false)}
                        />
                        <motion.div
                            key="sheet"
                            className="lg:hidden fixed left-0 right-0 bottom-0 z-50 flex flex-col"
                            style={{
                                height:     "72vh",
                                background: "var(--surface-container-low)",
                                borderTop:  "2px solid var(--primary)",
                                touchAction: "none",
                            }}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 26, stiffness: 260 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.3 }}
                            onDragEnd={(_, { offset, velocity }) => {
                                if (offset.y > 80 || velocity.y > 400) setMobile(false);
                            }}
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                                <div style={{ width: 40, height: 4, background: "var(--outline-variant)" }} />
                            </div>

                            <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                                 style={{ borderColor: "var(--outline-variant)" }}>
                                <span className="font-mono text-xs font-bold tracking-widest" style={{ color: "var(--primary)" }}>
                                    [ ARTICLE.INFO ]
                                </span>
                                <button
                                    onClick={() => setMobile(false)}
                                    className="font-mono text-xs px-2 py-1 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    style={{ color: "var(--on-surface-variant)", border: "1px solid var(--outline-variant)" }}
                                >
                                    [ × ]
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3"
                                 style={{ scrollbarWidth: "thin", scrollbarColor: "var(--outline-variant) transparent" }}>
                                <button
                                    onClick={() => setFocus(v => !v)}
                                    className="w-full font-mono text-xs px-3 py-2.5 border flex items-center gap-2 transition-colors"
                                    style={{
                                        borderColor: focus ? "var(--primary)" : "var(--outline-variant)",
                                        color:       focus ? "var(--primary)" : "var(--on-surface-variant)",
                                        background:  focus ? "rgba(98,0,170,0.06)" : "transparent",
                                    }}
                                >
                                    <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{focus ? "◉" : "◎"}</span>
                                    <span className="tracking-widest">FOCUS.MODE</span>
                                    <span className="ml-auto" style={{ fontSize: "0.6rem" }}>{focus ? "ON" : "OFF"}</span>
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="w-full font-mono text-xs px-3 py-2.5 border flex items-center gap-2 transition-colors"
                                    style={{
                                        borderColor: fullscreen ? "var(--primary)" : "var(--outline-variant)",
                                        color:       fullscreen ? "var(--primary)" : "var(--on-surface-variant)",
                                        background:  fullscreen ? "rgba(98,0,170,0.06)" : "transparent",
                                    }}
                                >
                                    <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>⛶</span>
                                    <span className="tracking-widest">FULLSCREEN</span>
                                    <span className="ml-auto" style={{ fontSize: "0.6rem" }}>{fullscreen ? "ON" : "OFF"}</span>
                                </button>
                                <FontSwitcher />
                                {right}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Focus mode TOC strip (Notion-style, H2 only) ──────── */}
            {focus && headings.filter(h => h.level === 2).length > 0 && (
                <div
                    className="hidden lg:flex items-center"
                    style={{ position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 30 }}
                    onMouseEnter={() => setTocHovered(true)}
                    onMouseLeave={() => setTocHovered(false)}
                >
                    <AnimatePresence>
                        {tocHovered && (
                            <motion.div
                                key="toc-panel"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 200 }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                style={{
                                    background:   "var(--surface-container-low)",
                                    borderLeft:   "1px solid var(--outline-variant)",
                                    borderTop:    "1px solid var(--outline-variant)",
                                    borderBottom: "1px solid var(--outline-variant)",
                                    overflow:     "hidden",
                                    flexShrink:   0,
                                }}
                                className="flex flex-col py-2"
                            >
                                {headings.filter(h => h.level === 2).map((h) => (
                                    <motion.a
                                        key={h.id}
                                        href={`#${h.id}`}
                                        className="font-mono text-xs py-1.5 truncate"
                                        style={{
                                            color:        activeId === h.id ? "var(--primary)" : "var(--on-surface-variant)",
                                            paddingLeft:  activeId === h.id ? "16px" : "12px",
                                            paddingRight: "12px",
                                            whiteSpace:   "nowrap",
                                            display:      "block",
                                            fontWeight:   activeId === h.id ? 600 : 400,
                                            transition:   "all 0.2s ease",
                                        }}
                                        whileHover={{ color: "var(--primary)", paddingLeft: "16px" }}
                                        transition={{ duration: 0.12 }}
                                    >
                                        {activeId === h.id && (
                                            <span style={{ marginRight: 6, fontSize: "0.55rem" }}>▶</span>
                                        )}
                                        {h.text}
                                    </motion.a>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Lines strip */}
                    <div className="flex flex-col justify-center gap-3 py-6 px-3" style={{ minWidth: 40 }}>
                        {headings.filter(h => h.level === 2).map((h) => {
                            const isActive = activeId === h.id;
                            return (
                                <motion.a
                                    key={h.id}
                                    href={`#${h.id}`}
                                    animate={{
                                        width:      isActive ? 44 : tocHovered ? 26 : 22,
                                        opacity:    isActive ? 1 : tocHovered ? 0.5 : 0.28,
                                        background: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                                        scaleY:     isActive ? 1.5 : 1,
                                    }}
                                    whileHover={{ width: isActive ? 44 : 40, opacity: 1, background: "var(--primary)", scaleY: 1.6 }}
                                    transition={{ duration: 0.18 }}
                                    style={{ display: "block", height: 3, flexShrink: 0, cursor: "pointer" }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Focus mode exit pill ───────────────────────────────── */}
            <AnimatePresence>
                {focus && (
                    <motion.div
                        key="focus-pill"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 font-mono text-xs px-3 py-2 border"
                        style={{
                            borderColor: "var(--primary)",
                            color:       "var(--primary)",
                            background:  "var(--surface-container)",
                            boxShadow:   "0 0 20px rgba(98,0,170,0.14)",
                        }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.35, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            ◉
                        </motion.span>
                        <span className="tracking-widest">FOCUS</span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span style={{ color: "var(--outline)" }}>F to exit</span>
                        <button
                            onClick={() => setFocus(false)}
                            className="ml-1 hover:opacity-60 transition-opacity"
                            aria-label="Exit focus mode"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
