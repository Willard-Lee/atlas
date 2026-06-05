import { getEntries } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";
import Link from "next/link";

export default async function ProjectPage(){
    const projects = getEntries<ProjectFrontmatter>("project");
    return (
        <main className = "px-16 py-24">
            <h1> Project Page </h1>
            <ul>
                {projects.map((project) => (
                    <li key = {project.slug}>
                        <Link href = {project.url}>
                            {project.frontmatter.title}
                        </Link>
                        <span>
                            {project.frontmatter.date}
                        </span>
                        <span>
                            {project.frontmatter.status}
                        </span>
                        <span>
                            {project.frontmatter.stack.join(", ")}
                        </span>
                    </li>
                ))}
            </ul>    
        </main>
    )
}