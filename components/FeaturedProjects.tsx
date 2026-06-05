
import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types"
import Link from "next/link"

export default function FeaturedProjects() {
    const projects = getEntries<ProjectFrontmatter>("project");
    
    return (
        <section className = "px-16 py-24"> {/* Section heading */}
            <h2 className = "text-xs font-bold tracking-widest mb-12" >  
                Projects
            </h2>
            <div className = "grid grid-cols-2 gap-6">  {/* Grid for each cards */}
                {projects.map((project) => ( 
                    <div key = {project.slug}  /* Card */
                        className = "p-6 transitions-colors"
                        style = {{ border: "1px solid var(--outline-variant"}}
                    > 
                        <Link href = {project.url}>
                            <h3 className = "text-xl font-bold mb-2" 
                                style = {{ color: "var(--font-display)"}}
                            > 
                            {project.frontmatter.title} {/* Card title */}
                            </h3>
                            <p className = "text-sm mb-4"
                                style = {{color: "var(--on-surface-variant"}}
                            > {project.frontmatter.summary} 
                            </p>
                            <div className = "flex gap-2 flex-wrap"> {/* Stack cips row */}
                                {project.frontmatter.stack.map((tech) =>(
                                    <span key = {tech}
                                        className = "text-xs px-2 py-1"
                                        style = {{fontFamily: "var(--font-mono",
                                                  background: "var(--surface-container-high)",
                                                  color: "var(--on-surface-variant)"
                                                }}
                                    
                                    >{tech}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    )
}