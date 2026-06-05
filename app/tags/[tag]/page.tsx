import { getAllEntries } from "@/lib/content";
import Link from "next/link";

export async function generateStaticParams() {
    const entries = getAllEntries();
    const tags = new Set(entries.flatMap((e) => e.frontmatter.tags ?? []));
    return [...tags].map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string}> }){
    const { tag } = await params;
    const entries = getAllEntries().filter((e) => (e.frontmatter.tags ?? []).includes(tag));
    return (
        <main className = "px-16 py-24">
            <h1>#{tag}</h1>
            <ul>
                {entries.map((entry) => (
                    <li key = {entry.url}>
                        <Link href = {entry.url}>
                            {entry.frontmatter.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}
