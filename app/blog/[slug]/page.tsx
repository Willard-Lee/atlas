import { getEntry, getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleLayout from "@/components/ArticleLayout";
import { CATEGORIES, getCategory } from "@/lib/categories";
import Link from "next/link";

function signalBar(readingTime: number) {
    const strength = Math.min(Math.ceil(readingTime / 2), 5);
    return "▮".repeat(strength) + "▯".repeat(5 - strength);
}

function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
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
        text:  m[2],
        id:    m[2].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    }));

    return (
        <main className="w-full">
            <ReadingProgress />

            {/* Cover image — full bleed with gradient fade */}
            {post.frontmatter.cover && (
                <div className="relative">
                    <img
                        src={post.frontmatter.cover}
                        alt=""
                        className={`w-full object-cover ${cat === "photography" ? "h-96" : "h-64"}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                         style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
                </div>
            )}

            {/* Hero */}
            <div className="dot-grid pt-16 pb-10">
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Link href="/blog"
                              className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                              style={{ color: "var(--on-surface-variant)" }}>
                            TRANSMISSION_LOG
                        </Link>
                        {catData && (
                            <>
                                <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                                <span className="font-mono text-xs tracking-widest" style={{ color: catData.color }}>
                                    {catData.symbol} {catData.label}
                                </span>
                            </>
                        )}
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-5 break-words leading-tight"
                        style={{ color: "var(--on-surface)" }}>
                        {post.frontmatter.title}
                    </h1>

                    {post.frontmatter.summary && (
                        <p className="font-sans text-lg mb-6 leading-relaxed max-w-2xl"
                           style={{ color: "var(--on-surface-variant)" }}>
                            {post.frontmatter.summary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 border-t"
                         style={{ borderColor: "var(--outline-variant)" }}>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {formatDate(post.frontmatter.date)}
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {readingTime} min read
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                            {wordCount.toLocaleString()} words
                        </span>
                        {catData && (
                            <span className="ml-auto font-mono text-xs" style={{ color: catData.color }}>
                                {signalBar(readingTime)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <ArticleLayout headings={headings} right={<>
                {headings.length > 0 && (
                    <div style={{ background: "var(--surface-container-low)", borderTop: "2px solid var(--primary)", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
                        <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                            <span className="font-mono text-xs font-bold tracking-widest" style={{ color: "var(--primary)" }}>[ CONTENTS ]</span>
                        </div>
                        <nav className="py-1">
                            {headings.map((h) => (
                                <a key={h.id} href={`#${h.id}`}
                                   className="flex items-center gap-2 py-1.5 font-mono text-xs transition-colors hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
                                   style={{ color: "var(--on-surface-variant)", paddingLeft: `${12 + (h.level - 1) * 12}px`, paddingRight: "12px" }}>
                                    <span style={{ color: "var(--outline)", flexShrink: 0, fontSize: "0.6rem" }}>{h.level === 1 ? "§" : "└"}</span>
                                    <span className="truncate">{h.text}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </>}>

                <article className="prose" style={{ fontFamily: "var(--reader-font, var(--font-dm-sans))", fontSize: "calc(1em * var(--reader-font-scale, 1))", fontWeight: "var(--reader-font-weight, 400)" }}>{content}</article>

                <div className="mt-16 pt-6 border-t flex items-center gap-4" style={{ borderColor: "var(--outline-variant)" }}>
                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--outline)" }}>─ END.OF.TRANSMISSION ─</span>
                    <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                </div>

                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-8">
                        {post.frontmatter.tags.map((tag) => (
                            <Link key={tag} href={`/tags/${tag}`}
                                  className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                  style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-10 space-y-4">
                    <Related url={post.url} />
                    <Backlinks url={post.url} />
                </div>

            </ArticleLayout>
        </main>
    );
}
