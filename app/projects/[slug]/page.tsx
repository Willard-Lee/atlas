import { getEntry, getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import ExcalidrawEmbed from "@/components/ExcalidrawEmbed";
import ArticleLayout from "@/components/ArticleLayout";
import Link from "next/link";

function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

const statusMeta: Record<string, { label: string; color: string }> = {
    live:     { label: "DEPLOYED",   color: "var(--secondary-container)" },
    wip:      { label: "STAGING",    color: "var(--primary-container)" },
    archived: { label: "DEPRECATED", color: "var(--on-surface-variant)" },
};

export async function generateStaticParams() {
    return getEntries<ProjectFrontmatter>("project").map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = getEntry<ProjectFrontmatter>("project", slug);
    if (!project) notFound();

    const content = await renderMDX(project.raw);
    const wordCount = project.raw.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const meta = statusMeta[project.frontmatter.status] ?? statusMeta.archived;
    const headings = [...project.raw.matchAll(/^(#{1,3})\s+(.+)$/gm)].map((m) => ({
        level: m[1].length,
        text:  m[2],
        id:    m[2].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    }));

    return (
        <main className="w-full">
            <ReadingProgress />

            {/* Cover image — full bleed with gradient fade */}
            {project.frontmatter.cover && (
                <div className="relative">
                    <img src={project.frontmatter.cover} alt="" className="w-full h-64 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                         style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
                </div>
            )}

            {/* Hero */}
            <div className="dot-grid pt-16 pb-10">
                <div className="max-w-5xl mx-auto px-6 md:px-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Link href="/projects"
                              className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                              style={{ color: "var(--on-surface-variant)" }}>
                            BUILD.MANIFEST
                        </Link>
                        <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: meta.color }}>■ {meta.label}</span>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-5 break-words leading-tight"
                        style={{ color: "var(--on-surface)" }}>
                        {project.frontmatter.title}
                    </h1>

                    {project.frontmatter.summary && (
                        <p className="font-sans text-lg mb-6 leading-relaxed max-w-2xl"
                           style={{ color: "var(--on-surface-variant)" }}>
                            {project.frontmatter.summary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 border-t"
                         style={{ borderColor: "var(--outline-variant)" }}>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {formatDate(project.frontmatter.date)}
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                            {readingTime} min read
                        </span>
                        <span style={{ color: "var(--outline)" }}>·</span>
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--outline)" }}>
                            {wordCount.toLocaleString()} words
                        </span>
                    </div>

                    {/* Tech stack + links — visible in hero on mobile, sidebar handles desktop */}
                    <div className="mt-5 pt-5 border-t flex flex-wrap items-center gap-2 lg:hidden"
                         style={{ borderColor: "var(--outline-variant)" }}>
                        {project.frontmatter.stack.map((t) => (
                            <span key={t} className="font-mono text-xs px-1.5 py-0.5"
                                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
                                {t}
                            </span>
                        ))}
                        {(project.frontmatter.demo || project.frontmatter.repo) && (
                            <div className="ml-auto flex gap-2">
                                {project.frontmatter.demo && (
                                    <a href={project.frontmatter.demo} target="_blank" rel="noopener noreferrer"
                                       className="font-mono text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                       style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        DEMO ↗
                                    </a>
                                )}
                                {project.frontmatter.repo && (
                                    <a href={project.frontmatter.repo} target="_blank" rel="noopener noreferrer"
                                       className="font-mono text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                       style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        REPO ↗
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ArticleLayout headings={headings} right={<>
                {/* Deploy status */}
                <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                    <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                         style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                        [ DEPLOY.STATUS ]
                    </div>
                    <div className="p-3 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs" style={{ color: meta.color }}>■</span>
                            <span className="font-mono text-xs tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>READ TIME</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{readingTime} MIN</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>WORDS</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{wordCount.toLocaleString()}</span>
                        </div>
                        {(project.frontmatter.demo || project.frontmatter.repo) && (
                            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "var(--outline-variant)" }}>
                                {project.frontmatter.demo && (
                                    <a href={project.frontmatter.demo} target="_blank" rel="noopener noreferrer"
                                       className="font-mono text-xs px-2 py-1.5 border text-center transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                       style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        DEMO ↗
                                    </a>
                                )}
                                {project.frontmatter.repo && (
                                    <a href={project.frontmatter.repo} target="_blank" rel="noopener noreferrer"
                                       className="font-mono text-xs px-2 py-1.5 border text-center transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                       style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        REPO ↗
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {project.frontmatter.stack.length > 0 && (
                    <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                        <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                             style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                            [ TECH.STACK ]
                        </div>
                        <div className="p-3 flex flex-wrap gap-1.5">
                            {project.frontmatter.stack.map((tech) => (
                                <span key={tech} className="font-mono text-xs px-1.5 py-0.5"
                                      style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

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
                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--outline)" }}>─ BUILD.COMPLETE ─</span>
                    <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                </div>

                {project.frontmatter.tags && project.frontmatter.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-8">
                        {project.frontmatter.tags.map((tag) => (
                            <Link key={tag} href={`/tags/${tag}`}
                                  className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                  style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                {project.frontmatter.excalidraw && (
                    <div className="mt-10">
                        <ExcalidrawEmbed file={project.frontmatter.excalidraw} />
                    </div>
                )}

                <div className="mt-10 space-y-4">
                    <Related url={project.url} />
                    <Backlinks url={project.url} />
                </div>

            </ArticleLayout>
        </main>
    );
}
