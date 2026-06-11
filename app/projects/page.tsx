import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import  ProjectsGrid from "@/components/ProjectsGrid";

export default async function ProjectPage(){
    const projects = getEntries<ProjectFrontmatter>("project");
    return (
        <main className = "px-16 py-24 mx-auto max-w-6xl">
            <h1 className = "text-5xl font-bold mb-2 leading-tight"
                style = {{ fontFamily: "var(--font-display)"}}
            >
                ATLAS PROJECTS
            </h1>
            <p className = "text-xs tracking-widest mb-12"
                style = {{
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            >
                SYSTEM MANIFEST / ACTIVE_NODES_LIST
            </p>
            <ProjectsGrid projects = {projects}/>
        </main>

      
      
    )
}