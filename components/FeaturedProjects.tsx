import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

const statusColor: Record<string, string> = {
    live:     "var(--secondary-container)",
    wip:      "var(--primary-container)",
    archived: "var(--on-surface-variant)",
};

// LCG seeded from the slug so each project gets stable-but-unique bar values
// without storing real metrics. Same slug → same bars across renders/builds.
function seededMetrics(slug: string): number[] {
    let s = 0;
    for (let i = 0; i < slug.length; i++) s = (s * 31 + slug.charCodeAt(i)) & 0xffff;
    return Array.from({ length: 3 }, () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return (s % 6) + 3; // 3–8
    });
}

export default function FeaturedProjects() {
    const projects = getEntries<ProjectFrontmatter>("project").filter((p) => p.frontmatter.featured);

    return (
        <section className="px-8 md:px-16 py-24 border-t" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="flex items-center justify-between mb-12">
                <h2 className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: "var(--on-surface-variant)" }}>
                    [ FEATURED.BUILDS ]
                </h2>
                <Link href="/projects"
                      className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                      style={{ color: "var(--on-surface-variant)" }}>
                    VIEW ALL →
                </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, i) => {
                    const color = statusColor[project.frontmatter.status];
                    const vals = seededMetrics(project.slug);
                    const labels = ["BUILD", "TEST", "PERF"];
                    const id = `PRJ_${String(i + 1).padStart(3, "0")}`;
                    const slug = project.slug.replace(/-/g, "_");

                    return (
                        <StaggerItem key={project.slug}>
                            <Link href={project.url}
                                  className="group flex flex-col border transition-all duration-200 hover:border-[var(--primary)] hover:-translate-y-1"
                                  style={{ border: "1px solid var(--outline-variant)", background: "var(--surface-container)" }}>

                                {/* Unique tile header — alternates terminal / metrics */}
                                <div className="h-40 overflow-hidden border-b"
                                     style={{ borderColor: "var(--outline-variant)" }}>
                                    {i % 2 === 0 ? (
                                        /* Terminal tile */
                                        <div className="w-full h-full flex flex-col p-4 font-mono text-xs"
                                             style={{ background: "#08080f" }}>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b"
                                                 style={{ borderColor: "var(--outline-variant)" }}>
                                                <span style={{ color: "var(--outline)" }}>{id}.sh</span>
                                                <span className="ml-auto px-1 border"
                                                      style={{ color, borderColor: color }}>
                                                    {project.frontmatter.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <p>
                                                    <span style={{ color: "var(--secondary-container)" }}>$ </span>
                                                    <span style={{ color: "var(--on-surface)" }}>atlas deploy {slug}</span>
                                                </p>
                                                {project.frontmatter.stack.slice(0, 3).map((tech) => (
                                                    <p key={tech}>
                                                        <span style={{ color: "var(--outline)" }}>  + </span>
                                                        <span style={{ color: "var(--primary)" }}>{tech}</span>
                                                    </p>
                                                ))}
                                                <p style={{ color }}>✓ build successful</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Metrics tile */
                                        <div className="w-full h-full flex flex-col p-4 font-mono text-xs"
                                             style={{ background: "var(--surface-container-low)" }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span style={{ color: "var(--outline)" }}>{id}</span>
                                                <span style={{ color }}>■ {project.frontmatter.status.toUpperCase()}</span>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                {labels.map((label, idx) => {
                                                    const v = vals[idx] ?? 5;
                                                    return (
                                                        <div key={label}>
                                                            <div className="flex justify-between mb-0.5">
                                                                <span style={{ color: "var(--outline)" }}>{label}</span>
                                                                <span style={{ color }}>{v * 10 + 10}%</span>
                                                            </div>
                                                            <div style={{ color, letterSpacing: "-1px" }}>
                                                                {"█".repeat(v)}
                                                                <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - v)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card body */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="font-mono text-xs" style={{ color }}>■</span>
                                        <span className="font-mono text-xs tracking-widest" style={{ color }}>
                                            {project.frontmatter.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <h3 className="font-display text-xl font-bold mb-2 transition-colors group-hover:text-[var(--primary)]"
                                        style={{ color: "var(--on-surface)" }}>
                                        {project.frontmatter.title}
                                    </h3>

                                    {project.frontmatter.summary && (
                                        <p className="font-sans text-sm mb-4 leading-relaxed"
                                           style={{ color: "var(--on-surface-variant)" }}>
                                            {project.frontmatter.summary}
                                        </p>
                                    )}

                                    <div className="flex gap-2 flex-wrap">
                                        {project.frontmatter.stack.map((tech) => (
                                            <span key={tech} className="font-mono text-xs px-2 py-0.5"
                                                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </StaggerItem>
                    );
                })}
            </StaggerContainer>
        </section>
    );
}
