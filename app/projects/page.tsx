import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import ProjectsGrid from "@/components/ProjectsGrid";
import Link from "next/link";

export default async function ProjectPage() {
    const projects = getEntries<ProjectFrontmatter>("project");
    const live     = projects.filter((p) => p.frontmatter.status === "live").length;
    const wip      = projects.filter((p) => p.frontmatter.status === "wip").length;
    const archived = projects.filter((p) => p.frontmatter.status === "archived").length;

    // Stack frequency
    const allStack = projects.flatMap((p) => p.frontmatter.stack);
    const stackFreq = [...new Set(allStack)]
        .map((t) => ({ tech: t, count: allStack.filter((x) => x === t).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const maxStack = Math.max(...stackFreq.map((s) => s.count), 1);

    // All tags
    const allTags = projects.flatMap((p) => p.frontmatter.tags ?? []);
    const tagFreq = [...new Set(allTags)]
        .map((t) => ({ tag: t, count: allTags.filter((x) => x === t).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <main className="w-full">

            {/* Header — full width */}
            <div className="dot-grid px-8 md:px-16 py-20 mb-0">
                <p className="font-mono text-xs tracking-widest mb-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    [ MISSION.CONTROL ] · DEPLOY_ENV: PRODUCTION
                </p>
                <h1 className="font-display text-6xl font-bold mb-6 glow">
                    BUILD.MANIFEST
                </h1>

                <div className="flex gap-8 flex-wrap">
                    {[
                        { label: "TOTAL",      value: projects.length, color: "var(--on-surface)" },
                        { label: "DEPLOYED",   value: live,            color: "var(--secondary-container)" },
                        { label: "STAGING",    value: wip,             color: "var(--primary-container)" },
                        { label: "DEPRECATED", value: archived,        color: "var(--on-surface-variant)" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-baseline gap-2">
                            <span className="font-display text-4xl font-bold" style={{ color }}>
                                {String(value).padStart(2, "0")}
                            </span>
                            <span className="font-mono text-xs tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 px-8 md:px-16 pb-24 pt-12">

                {/* ── Projects grid ── */}
                <div className="min-w-0">
                    <ProjectsGrid projects={projects} />
                </div>

                {/* ── Sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Stack frequency */}
                        {stackFreq.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ STACK.FREQ ]
                                </div>
                                <div className="p-3 space-y-2">
                                    {stackFreq.map(({ tech, count }) => {
                                        const bars = Math.round((count / maxStack) * 8);
                                        return (
                                            <div key={tech}>
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{tech}</span>
                                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{count}</span>
                                                </div>
                                                <div className="font-mono text-xs tracking-tighter"
                                                     style={{ color: "var(--primary-container)" }}>
                                                    {"█".repeat(bars)}
                                                    <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - bars)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Deploy breakdown */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ STATUS.MAP ]
                            </div>
                            <div className="p-3 space-y-2">
                                {[
                                    { label: "DEPLOYED",   value: live,     color: "var(--secondary-container)" },
                                    { label: "STAGING",    value: wip,      color: "var(--primary-container)" },
                                    { label: "DEPRECATED", value: archived, color: "var(--on-surface-variant)" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <span className="font-mono text-xs flex items-center gap-1.5" style={{ color }}>
                                            ■ {label}
                                        </span>
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top tags */}
                        {tagFreq.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ PROJECT.TAGS ]
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

                    </div>
                </aside>
            </div>
        </main>
    );
}
