import { getAllEntries } from "@/lib/content";
import Link from "next/link";

const typeLabel: Record<string, string> = {
    post:     "BLOG",
    project:  "PROJECT",
    note:     "NOTE",
    resource: "RESOURCE",
};

const typeColor: Record<string, string> = {
    post:     "var(--secondary-container)",
    project:  "var(--primary-container)",
    note:     "#4ade80",
    resource: "#facc15",
};

export async function generateStaticParams() {
    const entries = getAllEntries();
    const tags = new Set(entries.flatMap((e) => e.frontmatter.tags ?? []));
    return [...tags].map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const allEntries = getAllEntries().filter((e) => (e.frontmatter.tags ?? []).includes(tag));

    const grouped = allEntries.reduce((acc, entry) => {
        if (!acc[entry.type]) acc[entry.type] = [];
        acc[entry.type].push(entry);
        return acc;
    }, {} as Record<string, typeof allEntries>);

    const typeOrder = ["post", "project", "note", "resource"];
    const sortedTypes = typeOrder.filter((t) => grouped[t]);

    return (
        <main className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="dot-grid px-16 py-20 mb-16">
                <p className="font-mono text-xs tracking-widest mb-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    [ TAG.INDEX ] · FILTER: ACTIVE
                </p>
                <h1 className="font-display text-6xl font-bold mb-4">
                    #{tag}
                </h1>
                <p className="font-mono text-xs tracking-widest"
                   style={{ color: "var(--on-surface-variant)" }}>
                    {allEntries.length} {allEntries.length === 1 ? "ENTRY" : "ENTRIES"}
                </p>
            </div>

            {/* Grouped entries */}
            <div className="px-16 pb-24 space-y-16">
                {sortedTypes.map((type) => (
                    <div key={type} className="border-l-2 pl-6"
                         style={{ borderColor: "var(--outline-variant)" }}>

                        <h2 className="font-mono text-xs tracking-widest font-bold mb-6"
                            style={{ color: typeColor[type] ?? "var(--on-surface-variant)" }}>
                            {typeLabel[type] ?? type.toUpperCase()} ({grouped[type].length})
                        </h2>

                        <ul>
                            {grouped[type].map((entry) => (
                                <li key={entry.url}
                                    className="flex items-center justify-between gap-4 py-3 border-b"
                                    style={{ borderColor: "var(--outline-variant)" }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="font-mono text-xs flex-shrink-0"
                                              style={{ color: typeColor[type] ?? "var(--on-surface-variant)" }}>■</span>
                                        <Link href={entry.url}
                                              className="font-sans text-sm truncate transition-colors text-[var(--on-surface)] hover:text-[var(--primary)]">
                                            {entry.frontmatter.title}
                                        </Link>
                                    </div>
                                    <span className="font-mono text-xs flex-shrink-0"
                                          style={{ color: "var(--on-surface-variant)" }}>
                                        {entry.frontmatter.date}
                                    </span>
                                </li>
                            ))}
                        </ul>

                    </div>
                ))}
            </div>

        </main>
    );
}
