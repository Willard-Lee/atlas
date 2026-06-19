"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

// Updates coordinate text via direct DOM mutation — no React re-render per mouse move
function CoordDisplay({ x, y, hovering }: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    hovering: boolean;
}) {
    const xRef  = useRef<HTMLSpanElement>(null);
    const yRef  = useRef<HTMLSpanElement>(null);
    const dispX = useTransform(x, v => v + 18);
    const dispY = useTransform(y, v => v + 14);

    useEffect(() => {
        const pad = (n: number) => String(Math.round(Math.max(n, 0))).padStart(4, "0");
        const ux = x.on("change", v => { if (xRef.current) xRef.current.textContent = `x:${pad(v)}`; });
        const uy = y.on("change", v => { if (yRef.current) yRef.current.textContent = `y:${pad(v)}`; });
        return () => { ux(); uy(); };
    }, [x, y]);

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] font-mono select-none"
            style={{
                x: dispX,
                y: dispY,
                fontSize: "9px",
                letterSpacing: "0.06em",
                lineHeight: 1.6,
                color: hovering ? "var(--primary)" : "var(--outline)",
                transition: "color 0.15s",
            }}
        >
            <div><span ref={xRef}>x:0000</span></div>
            <div><span ref={yRef}>y:0000</span></div>
        </motion.div>
    );
}

export default function Cursor() {
    const [visible,  setVisible]  = useState(false);
    const [hovering, setHovering] = useState(false);
    const [ripples,  setRipples]  = useState<{ id: number; x: number; y: number }[]>([]);
    const nextId = useRef(0);

    // Inner dot — follows mouse exactly
    const dotX = useMotionValue(-200);
    const dotY = useMotionValue(-200);

    // Outer ring — spring lag
    const springCfg = { stiffness: 160, damping: 22 };
    const ringX = useSpring(-200, springCfg);
    const ringY = useSpring(-200, springCfg);

    // Center offset transforms so the cursor elements are centered on the pointer
    const outerLeft = useTransform(ringX, v => v - 22); // 44px / 2
    const outerTop  = useTransform(ringY, v => v - 22);
    const dotLeft   = useTransform(dotX,  v => v - 3);  //  6px / 2
    const dotTop    = useTransform(dotY,  v => v - 3);

    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const onMove = (e: MouseEvent) => {
            dotX.set(e.clientX);
            dotY.set(e.clientY);
            ringX.set(e.clientX);
            ringY.set(e.clientY);
            setVisible(true);

            const t = e.target as Element;
            setHovering(!!t.closest("a, button, [role='button'], input, select, textarea, [tabindex='0']"));
        };

        const onDown = (e: MouseEvent) => {
            const id = ++nextId.current;
            setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
        };

        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(true);

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mousedown", onDown);
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("mouseenter", onEnter);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onDown);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
        };
    }, [dotX, dotY, ringX, ringY]);

    const tickColor = hovering ? "var(--primary)" : "var(--outline)";

    return (
        <>
            {/* ── Inner dot ─────────────────────────────────────────── */}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key="cursor-dot"
                        className="fixed top-0 left-0 pointer-events-none z-[9999]"
                        style={{
                            x: dotLeft,
                            y: dotTop,
                            width: 6,
                            height: 6,
                            background: hovering ? "var(--secondary-container)" : "var(--primary)",
                            filter: hovering
                                ? "drop-shadow(0 0 5px var(--secondary-container))"
                                : "drop-shadow(0 0 4px var(--primary))",
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.12 }}
                    />
                )}
            </AnimatePresence>

            {/* ── Outer reticle (corner ticks + spring lag) ─────────── */}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key="cursor-ring"
                        className="fixed top-0 left-0 pointer-events-none z-[9998]"
                        style={{
                            x: outerLeft,
                            y: outerTop,
                            width: 44,
                            height: 44,
                            filter: hovering
                                ? "drop-shadow(0 0 7px var(--primary-container))"
                                : "none",
                        }}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: hovering ? 1 : 0.64 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    >
                        {/* 4 corner tick marks — terminal reticle style */}
                        {(["tl", "tr", "bl", "br"] as const).map(c => (
                            <span key={c} style={{
                                position: "absolute",
                                width: 9,
                                height: 9,
                                top:    c[0] === "t" ? 0 : undefined,
                                bottom: c[0] === "b" ? 0 : undefined,
                                left:   c[1] === "l" ? 0 : undefined,
                                right:  c[1] === "r" ? 0 : undefined,
                                borderTop:    c[0] === "t" ? `1.5px solid ${tickColor}` : undefined,
                                borderBottom: c[0] === "b" ? `1.5px solid ${tickColor}` : undefined,
                                borderLeft:   c[1] === "l" ? `1.5px solid ${tickColor}` : undefined,
                                borderRight:  c[1] === "r" ? `1.5px solid ${tickColor}` : undefined,
                                transition: "border-color 0.15s",
                            }} />
                        ))}

                        {/* Center cross — tiny + at center, only on hover */}
                        {hovering && (
                            <motion.span
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 4,
                                    height: 1,
                                    background: "var(--primary)",
                                    boxShadow: "0 0 4px var(--primary)",
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.12 }}
                            />
                        )}
                        {hovering && (
                            <motion.span
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 1,
                                    height: 4,
                                    background: "var(--primary)",
                                    boxShadow: "0 0 4px var(--primary)",
                                }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.12 }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Coordinate readout ────────────────────────────────── */}
            {visible && <CoordDisplay x={dotX} y={dotY} hovering={hovering} />}

            {/* ── Click ripple ──────────────────────────────────────── */}
            {ripples.map(({ id, x, y }) => (
                <motion.div
                    key={id}
                    className="fixed top-0 left-0 pointer-events-none z-[9997]"
                    style={{ border: "1px solid var(--primary)" }}
                    initial={{ x: x - 4,  y: y - 4,  width: 8,  height: 8,  opacity: 0.85 }}
                    animate={{ x: x - 30, y: y - 30, width: 60, height: 60, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onAnimationComplete={() =>
                        setRipples(r => r.filter(item => item.id !== id))
                    }
                />
            ))}
        </>
    );
}
