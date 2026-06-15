import { getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import Link from "next/link";

export default async function GardenPage() { 
    const notes = getEntries<NoteFrontmatter>("note");
    const maturityColor: Record<string, string> = {
        seedling: "#facc15",
        budding: "#00dbe9",
        evergreen: "#4ade80", 
    }
    const bySubject = notes.reduce((acc, note) => {
        const s = note.frontmatter.subject;
        if (!acc[s]) acc[s] = [];
        acc[s].push(note);
        return acc;
    }, {} as Record<string, typeof notes>)
    return (
        <main className = "px-16 py-24 max-w-6xl mx-auto"
        >
            <h1 className = "text-5xl font-bold mb-2"
                style = {{ fontFamily: "var(--font-display)"}}
            > GARDEN.DB 
            </h1>
            <p className = "text-xs tracking-widest mb-12"
                style = {{ 
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            >
                NODES: ACTIVE
            </p>
            <div className = "space-y-16">
                {Object.entries(bySubject).map(([subject, entries]) => (
                    <div key = {subject}>
                        <h2 className = "text-xs font-bold tracking-widest mb-6"
                            style = {{
                                fontFamily: "var(--font-mono)",
                                color: "var(--on-surface-variant)"
                            }}
                        >
                            {subject.toUpperCase()}
                        </h2>
                        <ul className = "space-y-4">
                            {entries.map((note) => (
                                <li key = {note.slug} className = "flex items-center gap-3">
                                    <span style = {{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        display: "inline-block",
                                        flexShrink: 0,
                                        background: maturityColor[note.frontmatter.maturity]
                                    }}
                                    />
                                        <Link href = {note.url}
                                            className = "text-base hover:underline"
                                            style = {{ color: "var(--on-surface)"}}
                                        >
                                            {note.frontmatter.title}
                                        </Link>
                                        <span className = "text-xs"
                                            style = {{ 
                                                fontFamily: "var(--font-mono)",
                                                color: "var(--on-surface-variant)"
                                            }}
                                        >
                                            {note.frontmatter.date}
                                        </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </main>
    )
}