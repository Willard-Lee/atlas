import { getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import Link from "next/link";

export default async function GardenPage() { 
    const notes = getEntries<NoteFrontmatter>("note");
    return (
        <main className = "px-16 py-24">
            <h1> Notes Page </h1>
            <ul>
                {notes.map((note) => (
                    <li key = {note.slug}>
                        <Link href = {note.url}>
                            {note.frontmatter.title}
                        </Link>
                        <span>
                            {note.frontmatter.maturity}
                        </span>
                        <span>
                            {note.frontmatter.subject}
                        </span>
                    </li>
                ))}
            </ul>
        </main>
    )
}