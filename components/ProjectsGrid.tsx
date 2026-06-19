"use client";
import { useState } from "react";
import type { Entry, ProjectFrontmatter } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = { projects: Entry<ProjectFrontmatter>[] };

const statusMeta: Record<string, { label: string; color: string }> = {
    live:     { label: "DEPLOYED",   color: "var(--secondary-container)" },
    wip:      { label: "STAGING",    color: "var(--primary-container)" },
    archived: { label: "DEPRECATED", color: "var(--on-surface-variant)" },
};

function seededMetrics(slug: string): number[] {
    let s = 0;
    for (let i = 0; i < slug.length; i++) s = (s * 31 + slug.charCodeAt(i)) & 0xffff;
    return Array.from({ length: 4 }, () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return (s % 6) + 3;
    });
}

function TileTerminal({ id, project, meta }: {
    id: string;
    project: Entry<ProjectFrontmatter>;
    meta: { label: string; color: string };
}) {
    const slug  = project.slug.replace(/-/g, "_");
    const stack = project.frontmatter.stack.slice(0, 4);
    return (
        <div className="w-full h-full flex flex-col p-4 font-mono text-xs overflow-hidden"
             style={{ background: "#0a0a0f", borderBottom: "1px solid var(--outline-variant)" }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                <span style={{ color: "var(--outline)" }}>{id}.sh</span>
                <span className="ml-auto px-1.5 py-0.5 border" style={{ color: meta.color, borderColor: meta.color }}>
                    {meta.label}
                </span>
            </div>
            <div className="space-y-1 flex-1">
                <p>
                    <span style={{ color: "var(--secondary-container)" }}>$ </span>
                    <span style={{ color: "var(--on-surface)" }}>atlas init {slug}</span>
                </p>
                <p style={{ color: "var(--outline)" }}>  ↳ resolving dependencies...</p>
                {stack.map((tech) => (
                    <p key={tech}>
                        <span style={{ color: "var(--outline)" }}>  + </span>
                        <span style={{ color: "var(--primary)" }}>{tech}</span>
                        <span style={{ color: "var(--outline)" }}> loaded</span>
                    </p>
                ))}
                <p style={{ color: meta.color }}>✓ {stack.length} module{stack.length !== 1 ? "s" : ""} ready</p>
            </div>
            <p className="mt-2" style={{ color: "var(--on-surface-variant)" }}>
                <span style={{ color: "var(--secondary-container)" }}>$ </span>
                <span style={{ display: "inline-block", width: "0.5rem", background: "var(--primary)", verticalAlign: "middle", height: "0.85em" }} />
            </p>
        </div>
    );
}

function TileMetrics({ id, project, meta }: {
    id: string;
    project: Entry<ProjectFrontmatter>;
    meta: { label: string; color: string };
}) {
    const vals   = seededMetrics(project.slug);
    const labels = ["INTEGRITY", "COVERAGE", "UPTIME", "LATENCY"];
    return (
        <div className="w-full h-full flex flex-col p-4 font-mono text-xs overflow-hidden"
             style={{ background: "var(--surface-container-low)" }}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                <span style={{ color: "var(--outline)" }}>{id}</span>
                <span style={{ color: meta.color }}>■ {meta.label}</span>
            </div>
            <div className="space-y-2 flex-1">
                {labels.map((label, idx) => {
                    const v = vals[idx] ?? 5;
                    return (
                        <div key={label}>
                            <div className="flex justify-between mb-0.5">
                                <span style={{ color: "var(--on-surface-variant)" }}>{label}</span>
                                <span style={{ color: meta.color }}>{v * 10 + 10}%</span>
                            </div>
                            <div style={{ color: meta.color, letterSpacing: "-1px" }}>
                                {"█".repeat(v)}
                                <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - v)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-1 flex-wrap mt-2 pt-2 border-t" style={{ borderColor: "var(--outline-variant)" }}>
                {project.frontmatter.stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="px-1 py-0.5"
                          style={{ background: "var(--surface-container-highest)", color: "var(--on-surface-variant)" }}>
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    );
}

function TileMatrix({ id, project, meta }: {
    id: string;
    project: Entry<ProjectFrontmatter>;
    meta: { label: string; color: string };
}) {
    const stack = [...project.frontmatter.stack];
    while (stack.length < 3) stack.push("");
    while (stack.length % 3 !== 0) stack.push("");
    const rows: string[][] = [];
    for (let i = 0; i < Math.min(stack.length, 9); i += 3) rows.push(stack.slice(i, i + 3));
    return (
        <div className="w-full h-full flex flex-col p-4 font-mono text-xs overflow-hidden"
             style={{ background: "var(--surface-container)" }}>
            <div className="flex items-center justify-between mb-3">
                <span style={{ color: "var(--outline)" }}>{id}</span>
                <span style={{ color: "var(--outline)" }}>STACK.MAP</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <table className="border-collapse w-full" style={{ border: "1px solid var(--outline-variant)" }}>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-2 py-1.5 text-center"
                                        style={{
                                            borderRight:  ci < 2 ? "1px solid var(--outline-variant)" : undefined,
                                            color:        cell ? "var(--primary)" : "var(--outline)",
                                            background:   cell ? undefined : "var(--surface-container-low)",
                                        }}>
                                        {cell || "· · ·"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: "var(--outline-variant)" }}>
                <span style={{ color: "var(--outline)" }}>{stack.filter(Boolean).length} MODULES</span>
                <span style={{ color: meta.color }}>■ {meta.label}</span>
            </div>
        </div>
    );
}

export default function ProjectsGrid({ projects }: Props) {
    const [filter, setFilter] = useState<"all" | "live" | "wip" | "archived">("all");
    const filtered = filter === "all" ? projects : projects.filter((p) => p.frontmatter.status === filter);

    return (
        <div>
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-10 border-b pb-4 gap-4 flex-wrap"
                 style={{ borderColor: "var(--outline-variant)" }}>
                <div className="flex gap-1 flex-wrap">
                    {(["all", "live", "wip", "archived"] as const).map((f) => {
                        const active = filter === f;
                        const meta   = f !== "all" ? statusMeta[f] : null;
                        return (
                            <motion.button key={f} onClick={() => setFilter(f)}
                                    whileTap={{ scale: 0.95 }}
                                    className="font-mono text-xs px-3 py-1.5 tracking-widest border transition-colors"
                                    style={{
                                        borderColor: active ? (meta?.color ?? "var(--primary)") : "var(--outline-variant)",
                                        color:       active ? (meta?.color ?? "var(--on-surface)") : "var(--on-surface-variant)",
                                        background:  active ? "var(--surface-container)" : "transparent",
                                    }}>
                                {f === "all" ? "ALL BUILDS" : meta?.label}
                            </motion.button>
                        );
                    })}
                </div>
                <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                    {filtered.length} RESULT{filtered.length !== 1 ? "S" : ""}
                </span>
            </div>

            {/* Grid — responsive cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project, i) => {
                    const meta     = statusMeta[project.frontmatter.status] ?? statusMeta.archived;
                    const id       = `PRJ_${String(i + 1).padStart(3, "0")}`;
                    const featured = i === 0;
                    const tileType = i % 3;

                    return (
                        <motion.div
                            key={project.slug}
                            className={featured ? "md:col-span-2 lg:col-span-2" : ""}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link href={project.url}
                                  className="group flex flex-col border transition-colors hover:border-[var(--primary)] h-full"
                                  style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                <div className={`w-full overflow-hidden ${featured ? "h-52 md:h-72" : "h-52"}`}>
                                    {project.frontmatter.cover
                                        ? <img src={project.frontmatter.cover} alt="" className="w-full h-full object-cover" />
                                        : tileType === 0
                                            ? <TileTerminal id={id} project={project} meta={meta} />
                                            : tileType === 1
                                                ? <TileMetrics id={id} project={project} meta={meta} />
                                                : <TileMatrix id={id} project={project} meta={meta} />}
                                </div>
                                <div className="flex flex-col flex-1 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>{id}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs" style={{ color: meta.color }}>■</span>
                                            <span className="font-mono text-xs tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-display font-bold mb-2 transition-colors group-hover:text-[var(--primary)]"
                                        style={{ fontSize: featured ? "1.25rem" : "1rem", color: "var(--on-surface)" }}>
                                        {project.frontmatter.title}
                                    </h3>
                                    {project.frontmatter.summary && (
                                        <p className="font-sans text-xs leading-relaxed mb-3 line-clamp-2"
                                           style={{ color: "var(--on-surface-variant)" }}>
                                            {project.frontmatter.summary}
                                        </p>
                                    )}
                                    <div className="flex gap-1.5 flex-wrap mt-auto">
                                        {project.frontmatter.stack.slice(0, featured ? 6 : 3).map((tech) => (
                                            <span key={tech} className="font-mono text-xs px-1.5 py-0.5 tag-hover"
                                                  style={{ background: "var(--surface-container-highest)", color: "var(--on-surface-variant)", border: "1px solid transparent" }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
