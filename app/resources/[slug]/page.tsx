import { getEntry, getEntries } from "@/lib/content";
import type { ResourceFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import  Backlinks  from "@/components/Backlinks";
import  Related from "@/components/Related";

export async function generateStaticParams() {
    return getEntries<ResourceFrontmatter>("resource").map((resource) => ({
        slug: resource.slug
    }))
}

export default async function ResourcePage({ params }: {params: Promise<{slug:string}>}){
    const { slug } = await params;
    const resource = getEntry<ResourceFrontmatter>("resource", slug);
    if(! resource) notFound();

    const content = await renderMDX(resource.raw);

    return (
        <main className = "px-16 py-24 max-w-2xl">
            <h1> {resource.frontmatter.title} </h1>
            <p> {resource.frontmatter.date} </p>
            <article> {content} </article>
            <Backlinks url = {resource.url}/>
            <Related url = {resource.url}/>
        </main>
    )
}