"use client";
import { useState } from "react";
import type { Entry, PostFrontmatter } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES, getCategory } from "@/lib/categories";

type Props = { posts: Entry<PostFrontmatter>[] };

function signalBar(readingTime: number) {
    const strength = Math.min(Math.ceil(readingTime / 2), 5);
    return "▮".repeat(strength) + "▯".repeat(5 - strength);
}

function seeded(slug: string) {
    let s = 0;
    for (let i = 0; i < slug.length; i++) s = (s * 31 + slug.charCodeAt(i)) & 0xffff;
    const next = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s; };
    return next;
}

function waveform(slug: string, len = 24): string {
    const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    const next = seeded(slug);
    return Array.from({ length: len }, () => chars[next() % chars.length]).join("");
}

function spectrum(slug: string, bars = 16): number[] {
    const next = seeded(slug);
    return Array.from({ length: bars }, () => (next() % 8) + 1);
}

function FeaturedTile({ post, catData }: {
    post: Entry<PostFrontmatter>;
    catData: (typeof CATEGORIES)[keyof typeof CATEGORIES] | null;
}) {
    const wave1 = waveform(post.slug, 28);
    const wave2 = waveform(post.slug + "_2", 28);
    const wave3 = waveform(post.slug + "_3", 28);
    const color = catData?.color ?? "var(--secondary-container)";
    return (
        <div className="w-full h-full flex flex-col justify-center p-6 font-mono overflow-hidden"
             style={{ background: "#08080f" }}>
            <div className="flex items-center gap-2 mb-6">
                <span className="text-xs px-2 py-0.5 border" style={{ color, borderColor: color }}>
                    INCOMING TRANSMISSION
                </span>
                <span className="text-xs" style={{ color: "var(--outline)" }}>{catData?.symbol ?? "◈"}</span>
            </div>
            <div className="space-y-1 overflow-hidden">
                <p className="text-base tracking-tighter" style={{ color }}>{wave1}</p>
                <p className="text-base tracking-tighter opacity-60" style={{ color }}>{wave2}</p>
                <p className="text-base tracking-tighter opacity-30" style={{ color }}>{wave3}</p>
            </div>
            <p className="mt-6 text-xs" style={{ color: "var(--outline)" }}>
                SIG_{post.frontmatter.date.replace(/-/g, "")}_001
            </p>
        </div>
    );
}

function BlogTileWave({ post, catData }: {
    post: Entry<PostFrontmatter>;
    catData: (typeof CATEGORIES)[keyof typeof CATEGORIES] | null;
}) {
    const wave  = waveform(post.slug, 20);
    const color = catData?.color ?? "var(--secondary-container)";
    return (
        <div className="w-full h-full flex flex-col justify-between p-3 font-mono text-xs overflow-hidden"
             style={{ background: "#08080f" }}>
            <div className="flex items-center justify-between">
                <span style={{ color: "var(--outline)" }}>SIG_{post.frontmatter.date.replace(/-/g, "").slice(0, 8)}</span>
                {catData && <span style={{ color }}>{catData.symbol}</span>}
            </div>
            <p className="text-base tracking-tighter my-2" style={{ color }}>{wave}</p>
            <p style={{ color: "var(--outline)" }}>{">"} SIGNAL {catData ? catData.label : "UNCATEGORIZED"}</p>
        </div>
    );
}

function BlogTileSpectrum({ post, catData }: {
    post: Entry<PostFrontmatter>;
    catData: (typeof CATEGORIES)[keyof typeof CATEGORIES] | null;
}) {
    const bars  = spectrum(post.slug, 12);
    const color = catData?.color ?? "var(--secondary-container)";
    const maxH  = 8;
    return (
        <div className="w-full h-full flex flex-col p-3 font-mono text-xs overflow-hidden"
             style={{ background: "var(--surface-container-low)" }}>
            <div className="flex items-center justify-between mb-2">
                <span style={{ color: "var(--outline)" }}>FREQ.SCAN</span>
                {catData && <span style={{ color }}>{catData.symbol} {catData.label}</span>}
            </div>
            <div className="flex items-end gap-0.5 flex-1 pb-1">
                {bars.map((h, i) => (
                    <div key={i} className="flex flex-col-reverse gap-0" style={{ flex: 1 }}>
                        {Array.from({ length: maxH }, (_, j) => (
                            <div key={j} style={{ height: "0.7rem",
                                background: j < h ? color : "var(--outline-variant)",
                                opacity: j < h ? (0.4 + (j / maxH) * 0.6) : 0.2 }} />
                        ))}
                    </div>
                ))}
            </div>
            <p className="mt-1" style={{ color: "var(--outline)" }}>{post.frontmatter.date}</p>
        </div>
    );
}

function BlogTileData({ post, catData, readingTime }: {
    post: Entry<PostFrontmatter>;
    catData: (typeof CATEGORIES)[keyof typeof CATEGORIES] | null;
    readingTime: number;
}) {
    const color = catData?.color ?? "var(--secondary-container)";
    const rows  = [
        { key: "DATE",     val: post.frontmatter.date },
        { key: "DURATION", val: `${readingTime} MIN` },
        { key: "STRENGTH", val: signalBar(readingTime) },
        { key: "FREQ",     val: catData?.label ?? "MISC" },
    ];
    return (
        <div className="w-full h-full flex flex-col p-3 font-mono text-xs overflow-hidden"
             style={{ background: "var(--surface-container)" }}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b"
                 style={{ borderColor: "var(--outline-variant)" }}>
                <span style={{ color: "var(--outline)" }}>SIGNAL.DATA</span>
                {catData && <span style={{ color }}>{catData.symbol}</span>}
            </div>
            <div className="space-y-1.5 flex-1">
                {rows.map(({ key, val }) => (
                    <div key={key} className="flex justify-between">
                        <span style={{ color: "var(--outline)" }}>{key}</span>
                        <span style={{ color }}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BlogGrid({ posts }: Props) {
    const [filter, setFilter] = useState<string>("all");
    const filtered = filter === "all" ? posts : posts.filter((p) => p.frontmatter.tags?.includes(filter));

    return (
        <div>
            {/* Frequency filter */}
            <div className="flex items-center justify-between mb-10 border-b pb-4 gap-4 flex-wrap"
                 style={{ borderColor: "var(--outline-variant)" }}>
                <div className="flex gap-1 flex-wrap">
                    <motion.button
                        onClick={() => setFilter("all")}
                        whileTap={{ scale: 0.95 }}
                        className="font-mono text-xs px-3 py-1.5 tracking-widest border transition-colors"
                        style={{
                            borderColor: filter === "all" ? "var(--on-surface)" : "var(--outline-variant)",
                            color:       filter === "all" ? "var(--on-surface)" : "var(--on-surface-variant)",
                        }}>
                        ALL FREQ
                    </motion.button>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                        <motion.button key={key} onClick={() => setFilter(key)}
                                whileTap={{ scale: 0.95 }}
                                className="font-mono text-xs px-3 py-1.5 tracking-widest border transition-colors"
                                style={{
                                    borderColor: filter === key ? cat.color : "var(--outline-variant)",
                                    color:       filter === key ? cat.color : "var(--on-surface-variant)",
                                }}>
                            {cat.symbol} {cat.label}
                        </motion.button>
                    ))}
                </div>
                <span className="font-mono text-xs shrink-0" style={{ color: "var(--secondary-container)" }}>
                    {filtered.length} SIGNAL{filtered.length !== 1 ? "S" : ""} FOUND
                </span>
            </div>

            {/* Featured post */}
            {filtered[0] && (() => {
                const post        = filtered[0];
                const cat         = getCategory(post.frontmatter.tags);
                const catData     = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null;
                const readingTime = Math.ceil(post.raw.split(/\s+/).length / 200);
                const sigId       = `SIG_${post.frontmatter.date.replace(/-/g, "")}_001`;

                return (
                    <motion.div
                        className="mb-10"
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href={post.frontmatter.external_url ?? post.url}
                              className="group flex flex-col md:grid md:grid-cols-2 border transition-colors hover:border-[var(--primary)]"
                              style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                            <div className="h-48 md:h-64 w-full overflow-hidden relative">
                                {post.frontmatter.cover
                                    ? <img src={post.frontmatter.cover} alt="" className="w-full h-full object-cover" />
                                    : <FeaturedTile post={post} catData={catData} />}
                            </div>
                            <div className="p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{sigId}</span>
                                        {catData && (
                                            <span className="font-mono text-xs px-2 py-0.5 border"
                                                  style={{ color: catData.color, borderColor: catData.color }}>
                                                {catData.symbol} {catData.label}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="font-display text-xl md:text-2xl font-bold mb-3 transition-colors group-hover:text-[var(--primary)]"
                                        style={{ color: "var(--on-surface)" }}>
                                        {post.frontmatter.title}
                                    </h2>
                                    {post.frontmatter.summary && (
                                        <p className="font-sans text-sm leading-relaxed mb-4"
                                           style={{ color: "var(--on-surface-variant)" }}>
                                            {post.frontmatter.summary}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{post.frontmatter.date}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs" style={{ color: catData?.color ?? "var(--secondary-container)" }}>
                                            {signalBar(readingTime)}
                                        </span>
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{readingTime} MIN</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })()}

            {/* Signal log — remaining posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.slice(1).map((post, i) => {
                    const cat         = getCategory(post.frontmatter.tags);
                    const catData     = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null;
                    const readingTime = Math.ceil(post.raw.split(/\s+/).length / 200);
                    const sigId       = `SIG_${post.frontmatter.date.replace(/-/g, "")}_${String(i + 2).padStart(3, "0")}`;
                    const tileType    = i % 3;
                    const color       = catData?.color ?? "var(--outline-variant)";

                    return (
                        <motion.div
                            key={post.slug}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href={post.frontmatter.external_url ?? post.url}
                                  className="group flex flex-col border transition-colors hover:border-[var(--primary)] h-full"
                                  style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                <div className="h-32 overflow-hidden border-b" style={{ borderColor: "var(--outline-variant)" }}>
                                    {post.frontmatter.cover
                                        ? <img src={post.frontmatter.cover} alt="" className="w-full h-full object-cover" />
                                        : tileType === 0
                                            ? <BlogTileWave post={post} catData={catData} />
                                            : tileType === 1
                                                ? <BlogTileSpectrum post={post} catData={catData} />
                                                : <BlogTileData post={post} catData={catData} readingTime={readingTime} />}
                                </div>
                                <div className="flex flex-col flex-1 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{sigId}</span>
                                        {catData && <span className="font-mono text-xs" style={{ color: catData.color }}>{catData.symbol}</span>}
                                    </div>
                                    <h3 className="font-display text-sm font-bold mb-2 transition-colors group-hover:text-[var(--primary)]"
                                        style={{ color: "var(--on-surface)" }}>
                                        {post.frontmatter.title}
                                    </h3>
                                    {post.frontmatter.summary && (
                                        <p className="font-sans text-xs leading-relaxed mb-3 line-clamp-2"
                                           style={{ color: "var(--on-surface-variant)" }}>
                                            {post.frontmatter.summary}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t"
                                         style={{ borderColor: "var(--outline-variant)" }}>
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{post.frontmatter.date}</span>
                                        <span className="font-mono text-xs" style={{ color }}>{signalBar(readingTime)}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
