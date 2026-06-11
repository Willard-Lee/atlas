"use client"

import { useState } from "react";
import type { Entry, ProjectFrontmatter } from "@/lib/types";
import Link from "next/link";

type Props = {
    projects: Entry<ProjectFrontmatter>[]
}

export default function ProjectsGrid({ projects }: Props){
    const [filter, setFilter] = useState< "all" | "live" | "wip" | "archived">("all")
    const filtered = filter === "all" ? projects : projects.filter(p => p.frontmatter.status === filter)
    return (
        <div>
            {/* filter bar */}
            <div className = "flex items-center justify-between mb-8">
                <div className = "flex gap-2">
                    {(["all", "live", "wip", "archived"] as const).map((f) => (
                        <button key = {f}
                                onClick = {() => setFilter(f)}
                                className = "text-xs px-3 py-1 tracking-widest"
                                style = {{ 
                                    fontFamily: "var(--font-mono)",
                                    background: filter === f ? "var(--primary-container)" : "var(--surface-container-high)",
                                    color: filter === f ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                                }}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
                <span className = "text-xs"
                    style = {{
                        fontFamily: "var(--font-mono)",
                        color: "var(--on-surface-variant)"
                    }}
                    >
                        SORT:CHRONO_DESC
                    </span>
            </div>
            {/* card bar */}
            <div className = "grid grid-cols-3 gap-6 mb-16"> 
                {filtered.map((project, i) => (
                    <Link 
                        key = {project.slug}
                        href = {project.url}
                        className = {`p-4 transition-colors ${ i === 0 ? "col-span-2": ""}`}
                        style = {{ 
                            border: "1px solid var(--outline-variant)"
                        }}
                    >
                        <div className = {`w-full object-cover mb-4 bg-surface-container ${i === 0 ? "h-72" : "h-48"}`}
                            style = {{background : "var(--surface-container-high)"}}
                        >
                            {project.frontmatter.cover && (
                                <img src = {project.frontmatter.cover} alt = "" className = "w-full h-full object-cover" />
                            )}

                        </div>
                        <p 
                            className = "text-xs mb-2"
                            style = {{
                                fontFamily: "var(--font-mono)",
                                color: "var(--on-surface-variant)"
                            }}
                        >
                            PRJ_00{i+1}
                        </p>
                        <h3 className = "font-bold mb-1"
                            style = {{ fontFamily: "var(--font-display)"}}
                        >
                            {project.frontmatter.title}
                        </h3>
                        <span 
                            className = "text-xs"
                            style = {{
                                fontFamily: "var(--font-mono)",
                                color: "var(--on-surface-variant)"
                            }}
                        >
                            {project.frontmatter.status.toUpperCase()}
                        </span>
                    </Link>
                ))}

            </div>

            {/* stats bar */}
            <div
                className = "flex gap-12 pt-8"
                style = {{ borderTop: "1px solid var(--outline-variant)"}}
            >
                {[
                    { label: "TOTAL_PROJECTS", value: projects.length},
                    { label: "LIVE", value: projects.filter(p => p.frontmatter.status === "live").length },
                    { label: "WIP", value: projects.filter(p => p.frontmatter.status === "wip").length },
                    { label: "ARCHIVED", value: projects.filter(p => p.frontmatter.status === "archived").length },
                

                ].map(stat => (
                    <div key = {stat.label}>
                        <p className = "text-xs tracking-widest mb-1" 
                            style = {{
                                fontFamily: "var(--font-mono)", 
                                color: "var(--primary)"
                            }}
                        >
                            {stat.label}    
                        </p>
                        <p className = "text-3xl font-bold"
                            style = {{ color: "var(--primary)"}}
                        >
                            {stat.value}
                        </p>
                    </div> 
                ))}

            </div>
            
        </div>
    )
}

// Card bar plan
// First card is featured  (large)