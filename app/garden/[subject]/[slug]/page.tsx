import { getEntry, getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related"

export async function generateStaticParams() {
    return getEntries<NoteFrontmatter>("note").map((note) => ({
        subject: note.frontmatter.subject,
        slug: note.slug,
    }));
}

export default async function NotePage({ params}: {params: Promise<{subject: string, slug: string}>}) {
    const { slug } = await params;
    const note = getEntry<NoteFrontmatter>("note", slug);
    if(!note) notFound();

    const content = await renderMDX(note.raw);

    return(
        <main className = "px-16 py-24 max-w-2xl">
            <h1>{note.frontmatter.title}</h1>
            <p>
                {note.frontmatter.date}
            </p>
            <article>{content}</article>
            <Backlinks url = {note.url}/>
            <Related url = {note.url}/>
        </main>
    )
}