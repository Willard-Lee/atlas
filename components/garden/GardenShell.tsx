"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const W      = 224; // sidebar width px
const NAV    = 56;  // navbar height px  (3.5rem)
const BTN_Y  = 80;  // button top offset from nav

const spring = { type: "spring", damping: 26, stiffness: 260 } as const;

export default function GardenShell({
    sidebar,
    children,
}: {
    sidebar:  React.ReactNode;
    children: React.ReactNode;
}) {
    const [open, setOpen]   = useState(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const v = localStorage.getItem("garden-sidebar-open");
        if (v !== null) setOpen(v !== "false");
        setReady(true);
    }, []);

    // Ctrl/Cmd+B toggles sidebar (matches VS Code / Obsidian convention)
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault();
                toggle();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = () =>
        setOpen((prev) => {
            const next = !prev;
            localStorage.setItem("garden-sidebar-open", String(next));
            return next;
        });

    return (
        <div className="flex-1 min-h-0 relative">

            {/* ── Floating sidebar ─────────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.aside
                        key="sidebar"
                        initial={{ x: -(W + 16) }}
                        animate={{ x: 0 }}
                        exit={{ x: -(W + 16) }}
                        transition={spring}
                        style={{
                            position:    "fixed",
                            display:     "flex",
                            flexDirection: "column",
                            left:        0,
                            top:         NAV,
                            bottom:      0,
                            width:       W,
                            zIndex:      40,
                            background:  "var(--surface-container-low)",
                            borderRight: "1px solid var(--outline-variant)",
                            boxShadow:   "12px 0 40px rgba(0,0,0,0.45)",
                        }}
                        /* hide on small screens */
                        className="hidden lg:flex"
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-3 py-3 border-b shrink-0"
                            style={{ borderColor: "var(--outline-variant)" }}
                        >
                            <span
                                className="font-mono text-xs font-bold tracking-widest"
                                style={{ color: "var(--primary)" }}
                            >
                                [ GARDEN.TREE ]
                            </span>
                            <kbd
                                className="font-mono"
                                style={{
                                    fontSize:        9,
                                    color:           "var(--outline)",
                                    border:          "1px solid var(--outline-variant)",
                                    padding:         "1px 4px",
                                    background:      "var(--surface-container)",
                                    letterSpacing:   1,
                                }}
                            >
                                ctrl+b
                            </kbd>
                        </div>

                        {/* Tree */}
                        <div
                            className="flex-1 overflow-y-auto min-h-0"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "var(--outline-variant) transparent",
                            }}
                        >
                            {sidebar}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Floating tab button ───────────────────────────────────── */}
            {/*
                The tab lives at the right edge of the sidebar.
                When open  → x = W  (attached to sidebar's right border)
                When closed → x = 0  (peeking at viewport left edge)
            */}
            <div
                className="hidden lg:block"
                style={{
                    position:  "fixed",
                    left:      0,
                    top:       NAV + BTN_Y,
                    zIndex:    41,
                    // No width/height here — motion child controls it
                }}
            >
                <motion.div
                    initial={false}
                    animate={{ x: ready ? (open ? W : 0) : (open ? W : 0) }}
                    transition={spring}
                >
                    <motion.button
                        onClick={toggle}
                        title={open ? "Close sidebar (ctrl+b)" : "Open sidebar (ctrl+b)"}
                        className="flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
                        style={{
                            width:      22,
                            height:     64,
                            background: "var(--surface-container-high)",
                            color:      "var(--on-surface-variant)",
                            fontFamily: "var(--font-mono)",
                            fontSize:   10,
                            border:     "1px solid var(--outline-variant)",
                            borderLeft: open ? "none" : "1px solid var(--outline-variant)",
                            cursor:     "pointer",
                        }}
                        whileHover={{ background: "var(--surface-container-highest, var(--surface-container-high))" } as never}
                        whileTap={{ scale: 0.94 }}
                    >
                        {/* Subtle primary accent line at top */}
                        <span
                            className="absolute top-0 left-0 right-0"
                            style={{
                                height:     2,
                                background: "var(--primary)",
                                opacity:    open ? 0.5 : 1,
                            }}
                        />

                        {/* Pulsing dot when collapsed */}
                        <AnimatePresence>
                            {!open && (
                                <motion.span
                                    key="dot"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                        width:        5,
                                        height:       5,
                                        background:   "var(--primary)",
                                        display:      "block",
                                        flexShrink:   0,
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Arrow icon */}
                        <span style={{ fontSize: 9, lineHeight: 1, flexShrink: 0 }}>
                            {open ? "◁" : "▷"}
                        </span>

                        {/* Vertical "TREE" label when collapsed */}
                        <AnimatePresence>
                            {!open && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.45 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        writingMode:  "vertical-rl",
                                        transform:    "rotate(180deg)",
                                        fontSize:     7,
                                        letterSpacing: 3,
                                        color:        "var(--outline)",
                                        userSelect:   "none",
                                        flexShrink:   0,
                                    }}
                                >
                                    TREE
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Subtle bottom accent line */}
                        <span
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                                height:     1,
                                background: "var(--outline-variant)",
                            }}
                        />
                    </motion.button>
                </motion.div>
            </div>

            {/* ── Main content — always full width ─────────────────────── */}
            <main className="min-h-0">
                {children}
            </main>
        </div>
    );
}
