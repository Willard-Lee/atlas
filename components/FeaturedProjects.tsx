import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

const statusColor: Record<string, string> = {
    live:     "var(--secondary-container)",
    wip:      "#facc15",
    archived: "var(--on-surface-variant)",
};

// LCG seeded from slug — stable-but-unique bar values without real metrics.
function seededMetrics(slug: string): number[] {
    let s = 0;
    for (let i = 0; i < slug.length; i++) s = (s * 31 + slug.charCodeAt(i)) & 0xffff;
    return Array.from({ length: 3 }, () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return (s % 6) + 3; // 3–8
    });
}

// ── Wide terminal tile (first/featured project) ──────────────────────────────

function TerminalTileWide({ slug, stack, status, id }: { slug: string; stack: string[]; status: string; id: string }) {
    const color = statusColor[status] ?? "var(--on-surface-variant)";
    const cmd   = slug.replace(/-/g, "_");
    const stackLines = stack.slice(0, 5);

    return (
        <div className="w-full h-full flex flex-col p-4 font-mono text-xs" style={{ background: "#08080f" }}>
            {/* Titlebar */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                <span style={{ color: "var(--outline)" }}>{id}.sh</span>
                <span className="ml-auto px-1.5 border" style={{ color, borderColor: color }}>
                    {status.toUpperCase()}
                </span>
            </div>
            {/* Deploy log */}
            <div className="space-y-1 flex-1">
                <p>
                    <span style={{ color: "var(--secondary-container)" }}>$ </span>
                    <span style={{ color: "var(--on-surface)" }}>atlas deploy {cmd} --env=production</span>
                </p>
                {stackLines.map((tech) => (
                    <p key={tech}>
                        <span style={{ color: "var(--outline)" }}>  + </span>
                        <span style={{ color: "var(--primary)" }}>{tech}</span>
                    </p>
                ))}
                {stack.length > 5 && (
                    <p style={{ color: "var(--outline)" }}>  + {stack.length - 5} more...</p>
                )}
            </div>
            {/* Build result */}
            <div className="mt-3 pt-2 border-t space-y-0.5" style={{ borderColor: "var(--outline-variant)" }}>
                <p style={{ color }}>✓ build successful</p>
                <p>
                    <span style={{ color: "var(--outline)" }}>↳ </span>
                    <span style={{ color: "var(--on-surface-variant)" }}>deployed · edge cdn · 0 downtime</span>
                </p>
            </div>
        </div>
    );
}

// ── Narrow metrics tile ──────────────────────────────────────────────────────

function MetricsTile({ slug, status, id }: { slug: string; status: string; id: string }) {
    const color  = statusColor[status] ?? "var(--on-surface-variant)";
    const vals   = seededMetrics(slug);
    const labels = ["BUILD", "TEST", "PERF"];

    return (
        <div className="w-full h-full flex flex-col p-4 font-mono text-xs" style={{ background: "var(--surface-container-low)" }}>
            <div className="flex items-center justify-between mb-3">
                <span style={{ color: "var(--outline)" }}>{id}</span>
                <span style={{ color }}>■ {status.toUpperCase()}</span>
            </div>
            <div className="space-y-3 flex-1">
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
    );
}

// ── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({
    project,
    index,
    wide = false,
}: {
    project: ReturnType<typeof getEntries<ProjectFrontmatter>>[number];
    index: number;
    wide?: boolean;
}) {
    const { title, summary, stack, status, featured: _f } = project.frontmatter;
    const color = statusColor[status] ?? "var(--on-surface-variant)";
    const id    = `PRJ_${String(index + 1).padStart(3, "0")}`;

    return (
        <Link
            href={project.url}
            className="group flex flex-col border transition-all duration-200 hover:border-[var(--primary)] hover:-translate-y-1 h-full"
            style={{ border: "1px solid var(--outline-variant)", background: "var(--surface-container)" }}
        >
            {/* Tile header */}
            <div
                className={`overflow-hidden border-b ${wide ? "h-52" : "h-44"}`}
                style={{ borderColor: "var(--outline-variant)" }}
            >
                {wide ? (
                    <TerminalTileWide slug={project.slug} stack={stack} status={status} id={id} />
                ) : (
                    <MetricsTile slug={project.slug} status={status} id={id} />
                )}
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1">
                {/* Status badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xs" style={{ color }}>■</span>
                    <span className="font-mono text-xs tracking-widest" style={{ color }}>
                        {status.toUpperCase()}
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="font-display font-bold mb-2 leading-snug transition-colors group-hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface)", fontSize: wide ? "1.25rem" : "1.1rem" }}
                >
                    {title}
                </h3>

                {/* Summary */}
                {summary && (
                    <p className="font-sans text-sm mb-4 leading-relaxed flex-1" style={{ color: "var(--on-surface-variant)" }}>
                        {summary}
                    </p>
                )}

                {/* Stack tags */}
                <div className="flex gap-2 flex-wrap mt-auto">
                    {stack.map((tech) => (
                        <span
                            key={tech}
                            className="font-mono text-xs px-2 py-0.5"
                            style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

// ── Section ──────────────────────────────────────────────────────────────────

export default function FeaturedProjects() {
    const projects = getEntries<ProjectFrontmatter>("project").filter((p) => p.frontmatter.featured);
    if (projects.length === 0) return null;

    const [first, ...rest] = projects;

    return (
        <section className="border-t" style={{ borderColor: "var(--outline-variant)" }}>

            {/* Editorial header */}
            <div className="flex items-start justify-between px-6 md:px-16 pt-16 pb-10">
                <div>
                    <p className="font-mono text-xs tracking-widest mb-2" style={{ color: "var(--outline)" }}>
                        [ 02 / FEATURED.BUILDS ]
                    </p>
                    <h2
                        className="font-display font-bold leading-none"
                        style={{ color: "var(--on-surface)", fontSize: "clamp(2.4rem, 5vw, 3.5rem)" }}
                    >
                        WHAT I&apos;VE<br />SHIPPED.
                    </h2>
                </div>
                <Link
                    href="/projects"
                    className="font-mono text-xs tracking-widest mt-1 transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface-variant)" }}
                >
                    VIEW ALL →
                </Link>
            </div>

            {/* Bento grid */}
            <div className="px-6 md:px-16 pb-16">
                <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* First project: wide (2/3 on desktop) */}
                    <StaggerItem className="lg:col-span-2">
                        <ProjectCard project={first} index={0} wide />
                    </StaggerItem>

                    {/* Remaining: narrow (1/3 each) */}
                    {rest.map((project, i) => (
                        <StaggerItem key={project.slug} className="lg:col-span-1">
                            <ProjectCard project={project} index={i + 1} />
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
