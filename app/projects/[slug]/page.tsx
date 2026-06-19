import { getEntry, getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";
import ReadingProgress from "@/components/ReadingProgress";
import ExcalidrawEmbed from "@/components/ExcalidrawEmbed";
import Link from "next/link";

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

            {/* Cover image */}
            {project.frontmatter.cover && (
                <img src={project.frontmatter.cover} alt="" className="w-full h-64 object-cover" />
            )}

            {/* Hero header */}
            <div className="dot-grid px-8 md:px-16 py-16 mb-0">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/projects"
                          className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                          style={{ color: "var(--on-surface-variant)" }}>
                        BUILD.MANIFEST
                    </Link>
                    <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>/</span>
                    <span className="font-mono text-xs tracking-widest" style={{ color: meta.color }}>
                        {meta.label}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs" style={{ color: meta.color }}>■</span>
                    <span className="font-mono text-xs tracking-widest px-2 py-0.5 border"
                          style={{ color: meta.color, borderColor: meta.color }}>
                        {meta.label}
                    </span>
                </div>

                <h1 className="font-display text-5xl font-bold mb-3" style={{ color: "var(--on-surface)" }}>
                    {project.frontmatter.title}
                </h1>

                {project.frontmatter.summary && (
                    <p className="font-sans text-base mb-4 leading-relaxed max-w-xl"
                       style={{ color: "var(--on-surface-variant)" }}>
                        {project.frontmatter.summary}
                    </p>
                )}

                <p className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                    {project.frontmatter.date} · {readingTime} min read
                </p>
            </div>

            {/* Two-column body */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 px-8 md:px-16 pb-24 pt-10">

                {/* ── Main content ── */}
                <div className="min-w-0">
                    {/* Tags */}
                    {project.frontmatter.tags && project.frontmatter.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-8">
                            {project.frontmatter.tags.map((tag) => (
                                <Link key={tag} href={`/tags/${tag}`}
                                      className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                      style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <article className="prose">{content}</article>

                    {project.frontmatter.excalidraw && (
                        <div className="mt-8">
                            <ExcalidrawEmbed file={project.frontmatter.excalidraw} />
                        </div>
                    )}

                    {/* Mobile fallback */}
                    <div className="mt-10 space-y-4 lg:hidden">
                        <Related url={project.url} />
                        <Backlinks url={project.url} />
                    </div>
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Deploy status + links */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ DEPLOY.STATUS ]
                            </div>
                            <div className="p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs" style={{ color: meta.color }}>■</span>
                                    <span className="font-mono text-xs tracking-widest" style={{ color: meta.color }}>
                                        {meta.label}
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
                                {(project.frontmatter.demo || project.frontmatter.repo) && (
                                    <div className="flex flex-col gap-2 pt-2 border-t"
                                         style={{ borderColor: "var(--outline-variant)" }}>
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

                        {/* Tech stack */}
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

                        {/* Related */}
                        <Related url={project.url} />

                        {/* Backlinks */}
                        <Backlinks url={project.url} />

                    </div>
                </aside>
            </div>
        </main>
    );
}
