import { getEntry, getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import { CATEGORIES, getCategory } from "@/lib/categories";
import Link from "next/link";

function signalBar(readingTime: number) {
    const strength = Math.min(Math.ceil(readingTime / 2), 5);
    return "▮".repeat(strength) + "▯".repeat(5 - strength);
}

export async function generateStaticParams() {
    return getEntries<PostFrontmatter>("post").map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getEntry<PostFrontmatter>("post", slug);
    if (!post) notFound();

    const content = await renderMDX(post.raw);
    const wordCount = post.raw.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const cat = getCategory(post.frontmatter.tags);
    const catData = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null;
    const headings = [...post.raw.matchAll(/^(#{1,3})\s+(.+)$/gm)].map((m) => ({
        level: m[1].length,
        text: m[2],
        id: m[2].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    }));

    return (
        <main className="w-full">
            <ReadingProgress />

            {/* Cover image — full bleed */}
            {post.frontmatter.cover && (
                <img
                    src={post.frontmatter.cover}
                    alt=""
                    className={`w-full object-cover ${cat === "photography" ? "h-96" : "h-64"}`}
                />
            )}

            {/* Hero header — full width */}
            <div className="dot-grid px-8 md:px-16 py-16 mb-0">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/blog"
                          className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                          style={{ color: "var(--on-surface-variant)" }}>
                        TRANSMISSION_LOG
                    </Link>
                    {catData && (
                        <>
                            <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                            <span className="font-mono text-xs tracking-widest" style={{ color: catData.color }}>
                                {catData.label}
                            </span>
                        </>
                    )}
                </div>

                {catData && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className="font-mono text-xs" style={{ color: catData.color }}>{catData.symbol}</span>
                        <span className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                              style={{ color: catData.color, borderColor: catData.color }}>
                            {catData.label}
                        </span>
                    </div>
                )}

                <h1 className="font-display text-5xl font-bold mb-4" style={{ color: "var(--on-surface)" }}>
                    {post.frontmatter.title}
                </h1>

                {post.frontmatter.summary && (
                    <p className="font-sans text-base mb-4 leading-relaxed max-w-xl"
                       style={{ color: "var(--on-surface-variant)" }}>
                        {post.frontmatter.summary}
                    </p>
                )}

                <p className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                    {post.frontmatter.date} · {readingTime} min read
                </p>
            </div>

            {/* Two-column body */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 px-8 md:px-16 pb-24 pt-10">

                {/* ── Main content ── */}
                <div className="min-w-0">
                    {/* Tags */}
                    {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-8">
                            {post.frontmatter.tags.map((tag) => (
                                <Link key={tag} href={`/tags/${tag}`}
                                      className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                      style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <article className="prose">{content}</article>

                    {/* Mobile fallback — related + backlinks (hidden on desktop, shown by sidebar) */}
                    <div className="mt-10 space-y-4 lg:hidden">
                        <Related url={post.url} />
                        <Backlinks url={post.url} />
                    </div>
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Signal stats */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ SIGNAL.STATS ]
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>STRENGTH</span>
                                    <span className="font-mono text-xs" style={{ color: catData?.color ?? "var(--secondary-container)" }}>
                                        {signalBar(readingTime)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>READ TIME</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{readingTime} MIN</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>WORDS</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{wordCount.toLocaleString()}</span>
                                </div>
                                {catData && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>FREQ</span>
                                        <span className="font-mono text-xs" style={{ color: catData.color }}>
                                            {catData.symbol} {catData.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table of contents */}
                        {headings.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ CONTENTS ]
                                </div>
                                <nav className="p-3 space-y-1">
                                    {headings.map((h) => (
                                        <a key={h.id} href={`#${h.id}`}
                                           className="block font-mono text-xs transition-colors hover:text-[var(--primary)] truncate"
                                           style={{
                                               color:       "var(--on-surface-variant)",
                                               paddingLeft: `${(h.level - 1) * 0.75}rem`,
                                           }}>
                                            {h.level > 1 && <span style={{ color: "var(--outline)" }}>└ </span>}
                                            {h.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Related signals */}
                        <Related url={post.url} />

                        {/* Backlinks */}
                        <Backlinks url={post.url} />

                    </div>
                </aside>
            </div>
        </main>
    );
}
