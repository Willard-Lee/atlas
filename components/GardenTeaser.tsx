import { getEntries } from "@/lib/content"
import type { NoteFrontmatter } from "@/lib/types"
import Link from "next/link"

export default function GardenTeaser() {
    const notes = getEntries<NoteFrontmatter>("note").slice(0,3);
    const maturityColor: Record<string, string> = {
        seedling: "#facc15",
        budding: "#00dbe9",
        evergreen: "#4ade80",
    }
    return (
        <section className = "px-16 py-24">
            <h2>
                Garden
            </h2>
            <ul>
                {notes.map((note) => (
                    <li key = {note.slug}>
                        <span 
                         style = {{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            display: "inline-block",
                            background: maturityColor[note.frontmatter.maturity] ?? "#fff",
                        }}
                        /> 
                        <Link href = {note.url}> {note.frontmatter.title} </Link>
                        <span> {note.frontmatter.subject} </span>
                    </li>
                ))}
            </ul>
            <Link href = "/garden"> Explore Garden </Link>
        </section>
    )
}