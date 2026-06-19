import { getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import BlogGrid from "@/components/BlogGrid";
import { CATEGORIES, getCategory } from "@/lib/categories";
import Link from "next/link";

export default async function BlogPage() {
    const posts = getEntries<PostFrontmatter>("post");

    // Sidebar stats
    const catCounts = Object.entries(CATEGORIES).map(([key, cat]) => ({
        key, cat,
        count: posts.filter((p) => getCategory(p.frontmatter.tags) === key).length,
    })).filter((c) => c.count > 0);

    const allTags = posts.flatMap((p) => p.frontmatter.tags ?? []);
    const tagFreq = [...new Set(allTags)]
        .map((t) => ({ tag: t, count: allTags.filter((x) => x === t).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    const maxCat = Math.max(...catCounts.map((c) => c.count), 1);

    return (
        <main className="w-full">

            {/* Header — full width */}
            <div className="dot-grid px-8 md:px-16 py-20 mb-0">
                <p className="font-mono text-xs tracking-widest mb-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    [ SIGNAL.STATION ] · RECEIVER: ONLINE
                </p>
                <h1 className="font-display text-6xl font-bold mb-6 glow">
                    TRANSMISSION_LOG
                </h1>

                <div className="flex gap-8 flex-wrap mb-6">
                    {[
                        { label: "SIGNALS LOGGED",  value: String(posts.length).padStart(2, "0") },
                        { label: "FREQUENCIES",      value: String(Object.keys(CATEGORIES).length).padStart(2, "0") },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-baseline gap-2">
                            <span className="font-display text-4xl font-bold" style={{ color: "var(--on-surface)" }}>
                                {value}
                            </span>
                            <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="font-mono text-xs" style={{ color: "var(--secondary-container)" }}>
                    {">"} SCANNING FREQUENCIES... SIGNAL ACQUIRED
                </p>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 px-8 md:px-16 pb-24 pt-12">

                {/* ── Blog grid ── */}
                <div className="min-w-0">
                    <BlogGrid posts={posts} />
                </div>

                {/* ── Sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Frequency breakdown */}
                        {catCounts.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ FREQ.BREAKDOWN ]
                                </div>
                                <div className="p-3 space-y-3">
                                    {catCounts.map(({ key, cat, count }) => {
                                        const bars = Math.round((count / maxCat) * 8);
                                        return (
                                            <div key={key}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-xs" style={{ color: cat.color }}>
                                                        {cat.symbol} {cat.label}
                                                    </span>
                                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                                        {count}
                                                    </span>
                                                </div>
                                                <div className="font-mono text-xs tracking-tighter" style={{ color: cat.color }}>
                                                    {"█".repeat(bars)}
                                                    <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - bars)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Top tags */}
                        {tagFreq.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ TOP.TAGS ]
                                </div>
                                <div className="p-3 flex flex-wrap gap-1.5">
                                    {tagFreq.map(({ tag, count }) => (
                                        <Link key={tag} href={`/tags/${tag}`}
                                              className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                              style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                            #{tag}
                                            {count > 1 && (
                                                <span className="ml-1" style={{ color: "var(--outline)" }}>×{count}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transmit info */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ STATION.INFO ]
                            </div>
                            <div className="p-3 space-y-1.5">
                                <p className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                    Personal transmissions from the intersection of code, markets, and the outdoors.
                                </p>
                                <p className="font-mono text-xs" style={{ color: "var(--secondary-container)" }}>
                                    {">"} SIGNAL: ACTIVE
                                </p>
                            </div>
                        </div>

                    </div>
                </aside>
            </div>
        </main>
    );
}
