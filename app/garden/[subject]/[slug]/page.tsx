import { getEntry, getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import Link from "next/link";

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

            {/* Hero header */}
            <div className="dot-grid px-8 md:px-16 py-16 mb-0">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/garden"
                          className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                          style={{ color: "var(--on-surface-variant)" }}>
                        LATENT.NODES
                    </Link>
                    <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                    <Link href={`/garden`}
                          className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                          style={{ color: "var(--on-surface-variant)" }}>
                        {note.frontmatter.subject.toUpperCase()}
                    </Link>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs" style={{ color }}>■</span>
                    <span className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                          style={{ color, borderColor: color }}>
                        {note.frontmatter.maturity.toUpperCase()}
                    </span>
                </div>

                <h1 className="font-display text-5xl font-bold mb-4" style={{ color: "var(--on-surface)" }}>
                    {note.frontmatter.title}
                </h1>

                <p className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                    {note.frontmatter.date} · {readingTime} min read
                </p>
            </div>

            {/* Two-column body */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 px-8 md:px-16 pb-24 pt-10">

                {/* ── Main content ── */}
                <div className="min-w-0">
                    {/* Tags */}
                    {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-8">
                            {note.frontmatter.tags.map((tag) => (
                                <Link key={tag} href={`/tags/${tag}`}
                                      className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                      style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <article className="prose">{content}</article>

                    {/* Mobile fallback */}
                    <div className="mt-10 space-y-4 lg:hidden">
                        <Backlinks url={note.url} />
                        <Related url={note.url} />
                    </div>
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Node info */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ NODE.INFO ]
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>MATURITY</span>
                                    <span className="font-mono text-xs" style={{ color }}>
                                        ■ {note.frontmatter.maturity.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>SUBJECT</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>
                                        {note.frontmatter.subject.toUpperCase()}
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
                                <p className="font-mono text-xs pt-2 border-t" style={{ borderColor: "var(--outline-variant)", color }}>
                                    {maturityDesc[note.frontmatter.maturity]}
                                </p>
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

                        {/* Backlinks */}
                        <Backlinks url={note.url} />

                        {/* Related */}
                        <Related url={note.url} />

                    </div>
                </aside>
            </div>
        </main>
    );
}
