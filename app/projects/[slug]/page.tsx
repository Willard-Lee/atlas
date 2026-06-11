import {getEntry, getEntries} from "@/lib/content";
import type { ProjectFrontmatter} from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related";

export async function generateStaticParams() {
    return getEntries<ProjectFrontmatter>("project").map((project) => ({
        slug: project.slug,
    }))
}

export default async function ProjectPage({ params }: { params: Promise<{slug: string}>}) {
    const { slug } = await params;
    const project = getEntry<ProjectFrontmatter>("project", slug);
    if(!project) notFound();

    const content = await renderMDX(project.raw);
    const readingTime = Math.ceil(project.raw.split(/\s+/).length / 200) 
    // readingTime  splits the raw MDX text by whitespace to count words, then divides by 200 (average reading speed). 
    // Math.ceil rounds up so you never get "0 min read".
    const statusColor = {
        live: "var(--secondary)",
        wip: "var(--primary)",
        archived: "var(--on-surface-variant)"
    }

    const headings = [...project.raw.matchAll(/^#{1,3}\s+(.+)$/gm)].map(m=> m[1]);

    return (
        <main className="px-16 py-24 max-w-3xl mx-auto">
            {project.frontmatter.cover && (
                <img src = {project.frontmatter.cover} alt = "" className = "w-full h-64 object-cover mb-12"/>
            )}
            {/* Status Badge */}
            <span 
                className = "text-xs font-bold tracking-widest "
                style = {{ 
                    fontFamily: "var(--font-mono)",
                    color: statusColor[project.frontmatter.status]}}
            >
                * {project.frontmatter.status.toUpperCase()}
            </span> 
            {/* Title */}
            <h1 
                className = "text-5xl font-bold mb-2"
                style = {{ fontFamily: "var(--font-display)"}}
            >
                {project.frontmatter.title}
            </h1>
            {/* Summary */}
            {project.frontmatter.summary && (
                <p className = "text-base mb-2"
                    style = {{ color: "var(--on-surface-variant)"}}
                >
                    {project.frontmatter.summary}
                </p>
            )}
            <p
                className = "text-xs mb-8"
                style = {{ 
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            >
                {project.frontmatter.date} · {readingTime} min read
            </p>         
            <div className = "flex gap-2 flex-wrap mb-8">
                {project.frontmatter.stack.map((tech) => (
                    <span
                        key = {tech}
                        className = "text-xs px-2 py-1"
                        style = {{
                            fontFamily: "var(--font-mono)",
                            background: "var(--surface-container-high)",
                            color: "var(--on-surface-variant)",
                        }}
                        >
                            {tech}
                        </span>
                ))}
            </div>
            <div className = "flex gap-4 mb-12">
                {project.frontmatter.demo && (
                    <a href = {project.frontmatter.demo}
                        className = "text-xs px-4 py-2 tracking-widest"
                        style = {{
                            fontFamily: "var(--font-mono)",
                            color: "var(--primary)",
                            border: "1px solid var(--primary)"
                        }}
                    >
                        DEMO →
                    </a>
                )}
                {project.frontmatter.repo && (
                    <a href = {project.frontmatter.repo}
                        className = "text-xs px-4 py-2 tracking-widest"
                        style = {{
                            fontFamily: "var(--font-mono)",
                            color: "var(--primary)",
                            border: "1px solid var(--primary)"
                        }}
                    >
                        REPO →
                    </a>    

                        
                )}
                    
                
            </div>
            {headings.length > 0 && (
                <nav className = "mb-12">
                    <p 
                        className = "text-xs font-bold tracking-widest mb-4"
                        style = {{
                            fontFamily: "var(--font-mono)",
                            color: "var(--on-surface-variant)",
                        }}
                    > 
                        CONTENTS 
                    </p>
                    {headings.map((heading) => (
                        <a
                            key = {heading}
                            href = { "#" + heading.toLowerCase().replace(/\s+/g,"-")}
                            className = "block text-sm mb-1"
                            style = {{
                                fontFamily: "var(--font-mono)",
                                color: "var(--primary)",
                            }}
                        >
                            {heading}
                        </a>
                    ))}
                </nav>
                )}
            <article className = "prose">{content}</article>
            <div className = "flex gap-2 flex-wrap mt-12">
                {project.frontmatter.tags && project.frontmatter.tags.map((tag) => (
                    <span
                        key = {tag}
                        className = "text-xs px-2 py-1"
                        style = {{
                            fontFamily: "var(--font-mono)",
                            background: "var(--surface-container-high)",
                            color: "var(--on-surface-variant)",
                        }}
                        >
                            {tag}
                        </span>
                ))}
            </div>
            
            <Backlinks url = {project.url}/>
            <Related url = {project.url}/>
        </main>
    );
}


