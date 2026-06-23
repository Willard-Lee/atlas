import { getEntry, getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleLayout from "@/components/ArticleLayout";
import Link from "next/link";

function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

const maturityColor: Record<string, string> = {
    seedling:  "#facc15",
    budding:   "#00dbe9",
    evergreen: "#4ade80",
};

const maturityDesc: Record<string, string> = {
    seedling:  "Early idea, needs cultivation",
    budding:   "Developing thought, taking shape",
    evergreen: "Mature, stable knowledge",
};

export async function generateStaticParams() {
    return getEntries<NoteFrontmatter>("note").map((note) => ({
        subject: note.frontmatter.subject,
        slug:    note.slug,
    }));
}

export default async function NotePage({ params }: { params: Promise<{ subject: string; slug: string }> }) {
    const { slug } = await params;
    const note = getEntry<NoteFrontmatter>("note", slug);
    if (!note) notFound();

    const content = await renderMDX(note.raw);
    const wordCount = note.raw.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const color = maturityColor[note.frontmatter.maturity] ?? "var(--on-surface-variant)";
    const headings = [...note.raw.matchAll(/^(#{1,3})\s+(.+)$/gm)].map((m) => ({
        level: m[1].length,
        text:  m[2],
        id:    m[2].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    }));

    return (
        <main className="w-full">
            <ReadingProgress />

            {/* Hero */}
            <div className="dot-grid pt-16 pb-10">
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-5">
                        <Link href="/garden"
                              className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                              style={{ color: "var(--on-surface-variant)" }}>
                            LATENT.NODES
                        </Link>
                        <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                        <Link href="/garden"
                              className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                              style={{ color: "var(--on-surface-variant)" }}>
                            {note.frontmatter.subject.toUpperCase()}
                        </Link>
                        <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color }}>■ {note.frontmatter.maturity.toUpperCase()}</span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 break-words leading-tight"
                        style={{ color: "var(--on-surface)" }}>
                        {note.frontmatter.title}
                    </h1>

                    {maturityDesc[note.frontmatter.maturity] && (
                        <p className="font-sans text-lg mb-6 leading-relaxed italic max-w-2xl" style={{ color }}>
                            {maturityDesc[note.frontmatter.maturity]}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 border-t"
                         style={{ borderColor: "var(--outline-variant)" }}>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {formatDate(note.frontmatter.date)}
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {readingTime} min read
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                            {wordCount.toLocaleString()} words
                        </span>
                        {note.frontmatter.updated && (
                            <>
                                <span style={{ color: "var(--outline)" }}>·</span>
                                <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                                    updated {formatDate(note.frontmatter.updated)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ArticleLayout headings={headings} right={<>
                {/* Node info */}
                <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                    <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                         style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                        [ NODE.INFO ]
                    </div>
                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>MATURITY</span>
                            <span className="font-mono text-xs" style={{ color }}>■ {note.frontmatter.maturity.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>SUBJECT</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{note.frontmatter.subject.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>READ TIME</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{readingTime} MIN</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>WORDS</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{wordCount.toLocaleString()}</span>
                        </div>
                        <p className="font-mono text-xs pt-2 border-t" style={{ borderColor: "var(--outline-variant)", color }}>
                            {maturityDesc[note.frontmatter.maturity]}
                        </p>
                    </div>
                </div>

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
                    <span className="font-mono text-xs shrink-0" style={{ color }}>■ {note.frontmatter.maturity.toUpperCase()}</span>
                    <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--outline)" }}>NODE.COMPLETE</span>
                </div>

                {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-8">
                        {note.frontmatter.tags.map((tag) => (
                            <Link key={tag} href={`/tags/${tag}`}
                                  className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                  style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-10 space-y-4">
                    <Backlinks url={note.url} />
                    <Related url={note.url} />
                </div>

            </ArticleLayout>
        </main>
    );
}
