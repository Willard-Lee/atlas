import type { Metadata } from "next";
import FadeUp from "@/components/motion/FadeUp";
import BootSequence from "@/components/motion/BootSequence";
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog";

export const metadata: Metadata = {
    title: "Changelog — Atlas",
    description: "Running, dated release history for Atlas.",
};

const bootLines = [
    "$ git log --oneline --tags",
    "> resolving refs...",
    "> release history acquired",
];

// group key → { glyph, color } — terminal-style prefixes
const GROUPS: { key: keyof ChangelogEntry["changes"]; label: string; glyph: string; color: string }[] = [
    { key: "added",    label: "ADDED",    glyph: "+", color: "#4ade80" },
    { key: "changed",  label: "CHANGED",  glyph: "~", color: "var(--primary)" },
    { key: "fixed",    label: "FIXED",    glyph: "✕", color: "var(--secondary-container)" },
    { key: "security", label: "SECURITY", glyph: "⚠", color: "var(--error)" },
];

export default function ChangelogPage() {
    return (
        <main className="w-full">

            {/* ── Boot header ─────────────────────────────────────────── */}
            <div className="dot-grid px-4 md:px-16 py-12 md:py-20 mb-0">
                <div className="mb-6">
                    <BootSequence lines={bootLines} />
                </div>
                <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold mb-2 glow">
                    CHANGELOG
                </h1>
                <p className="font-mono text-xs tracking-widest mt-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    ATLAS.SYS // RELEASE HISTORY
                </p>
            </div>

            {/* ── Releases ────────────────────────────────────────────── */}
            <div className="border-t px-4 md:px-16 py-10 md:py-14 space-y-12"
                 style={{ borderColor: "var(--outline-variant)" }}>
                {CHANGELOG.map((entry, i) => (
                    <FadeUp key={entry.version} delay={i * 0.05}>
                        <section>
                            {/* Version + date divider */}
                            <div className="flex items-baseline gap-3 mb-5">
                                <span className="font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
                                    v{entry.version}
                                </span>
                                <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                                    {entry.date}
                                </span>
                                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                            </div>

                            {entry.title && (
                                <p className="font-mono text-xs tracking-widest mb-5" style={{ color: "var(--on-surface-variant)" }}>
                                    {entry.title}
                                </p>
                            )}

                            {/* Change groups */}
                            <div className="space-y-5">
                                {GROUPS.map(({ key, label, glyph, color }) => {
                                    const items = entry.changes[key];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={key}>
                                            <div className="font-mono text-xs font-bold tracking-widest mb-2" style={{ color }}>
                                                {label}
                                            </div>
                                            <ul className="list-none m-0 p-0 space-y-1.5">
                                                {items.map((item, j) => (
                                                    <li key={j} className="flex gap-2 leading-relaxed">
                                                        <span className="font-mono shrink-0 select-none" style={{ color }}>{glyph}</span>
                                                        <span style={{ color: "var(--on-surface)" }}>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </FadeUp>
                ))}
            </div>
        </main>
    );
}
