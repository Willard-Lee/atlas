import { getEntry, getEntries } from "@/lib/content";
import type { ResourceFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import Link from "next/link";

const typeColor: Record<string, string> = {
    paper:   "var(--primary)",
    book:    "var(--secondary)",
    article: "var(--on-surface-variant)",
    dataset: "#4ade80",
    slides:  "#facc15",
};

const typeSymbol: Record<string, string> = {
    paper:   "◈",
    book:    "▣",
    article: "◎",
    dataset: "⬡",
    slides:  "▲",
};

export async function generateStaticParams() {
    return getEntries<ResourceFrontmatter>("resource").map((resource) => ({
        slug: resource.slug,
    }));
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const resource = getEntry<ResourceFrontmatter>("resource", slug);
    if (!resource) notFound();

    const content = await renderMDX(resource.raw);
    const wordCount = resource.raw.split(/\s+/).length;
    const color = typeColor[resource.frontmatter.type] ?? "var(--on-surface-variant)";
    const symbol = typeSymbol[resource.frontmatter.type] ?? "■";
    const hasNotes = resource.raw.trim().replace(/---[\s\S]*?---/, "").trim().length > 0;

    return (
        <main className="w-full">
            <ReadingProgress />

            {/* Hero header */}
            <div className="dot-grid px-8 md:px-16 py-16 mb-0">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/resources"
                          className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                          style={{ color: "var(--on-surface-variant)" }}>
                        SIGNAL.ARCHIVE
                    </Link>
                    <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                    <span className="font-mono text-xs tracking-widest" style={{ color }}>
                        {resource.frontmatter.type.toUpperCase()}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs" style={{ color }}>{symbol}</span>
                    <span className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                          style={{ color, borderColor: color }}>
                        {resource.frontmatter.type.toUpperCase()}
                    </span>
                </div>

                <h1 className="font-display text-5xl font-bold mb-3" style={{ color: "var(--on-surface)" }}>
                    {resource.frontmatter.title}
                </h1>

                <p className="font-mono text-xs mb-1" style={{ color: "var(--on-surface-variant)" }}>
                    {resource.frontmatter.authors.join(", ")}
                </p>

                <p className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                    {resource.frontmatter.year}
                    {resource.frontmatter.publisher && ` · ${resource.frontmatter.publisher}`}
                </p>
            </div>

            {/* Two-column body */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 px-8 md:px-16 pb-24 pt-10">

                {/* ── Main content ── */}
                <div className="min-w-0">
                    {/* Tags */}
                    {resource.frontmatter.tags && resource.frontmatter.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-8">
                            {resource.frontmatter.tags.map((tag) => (
                                <Link key={tag} href={`/tags/${tag}`}
                                      className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                      style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {hasNotes && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="font-mono text-xs tracking-widest font-bold"
                                      style={{ color: "var(--on-surface-variant)" }}>
                                    MY NOTES
                                </span>
                                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                            </div>
                            <article className="prose">{content}</article>
                        </>
                    )}

                    {/* Mobile fallback */}
                    <div className="mt-10 space-y-4 lg:hidden">
                        <Related url={resource.url} />
                        <Backlinks url={resource.url} />
                    </div>
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Source info */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ SOURCE.INFO ]
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>TYPE</span>
                                    <span className="font-mono text-xs" style={{ color }}>
                                        {symbol} {resource.frontmatter.type.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>YEAR</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>
                                        {resource.frontmatter.year}
                                    </span>
                                </div>
                                {resource.frontmatter.publisher && (
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-mono text-xs shrink-0" style={{ color: "var(--on-surface-variant)" }}>PUB</span>
                                        <span className="font-mono text-xs text-right" style={{ color: "var(--on-surface)" }}>
                                            {resource.frontmatter.publisher}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--on-surface-variant)" }}>AUTHORS</span>
                                    <span className="font-mono text-xs text-right leading-relaxed" style={{ color: "var(--on-surface)" }}>
                                        {resource.frontmatter.authors.join(", ")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        {(resource.frontmatter.url || resource.frontmatter.doi) && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ LINKS ]
                                </div>
                                <div className="p-3 space-y-2">
                                    {resource.frontmatter.url && (
                                        <a href={resource.frontmatter.url} target="_blank" rel="noopener noreferrer"
                                           className="flex items-center gap-2 font-mono text-xs transition-colors hover:text-[var(--primary)]"
                                           style={{ color: "var(--secondary-container)" }}>
                                            <span>↗</span>
                                            <span>VIEW SOURCE</span>
                                        </a>
                                    )}
                                    {resource.frontmatter.doi && (
                                        <div className="font-mono text-xs break-all" style={{ color: "var(--on-surface-variant)" }}>
                                            <span style={{ color: "var(--outline)" }}>DOI: </span>
                                            {resource.frontmatter.doi}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Related */}
                        <Related url={resource.url} />

                        {/* Backlinks */}
                        <Backlinks url={resource.url} />

                    </div>
                </aside>
            </div>
        </main>
    );
}
