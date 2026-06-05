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
    
    return (
        <main className="px-16 py-24 max-w-2xl">
            <h1>{project.frontmatter.title}</h1>
            <p>{project.frontmatter.date}</p>
            <article>{content}</article>
            <Backlinks url = {project.url}/>
            <Related url = {project.url}/>
        </main>
    );
}

