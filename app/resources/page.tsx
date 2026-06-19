import { getEntries } from '@/lib/content';
import type { ResourceFrontmatter } from '@/lib/types';
import Link from 'next/link';

const typeColor: Record<string, string> = {
    paper:   "var(--primary)",
    book:    "var(--secondary)",
    article: "var(--on-surface-variant)",
    dataset: "#4ade80",
    slides:  "#facc15",
};

const typeSymbol: Record<string, string> = {
    paper:   "◈",
    book:    "▣",
    article: "◎",
    dataset: "⬡",
    slides:  "▲",
};

export default async function ResourcePage() {
    const resources = getEntries<ResourceFrontmatter>("resource")
        .filter(r => !r.frontmatter.private);

    const byType = resources.reduce((acc, r) => {
        const t = r.frontmatter.type;
        if (!acc[t]) acc[t] = [];
        acc[t].push(r);
        return acc;
    }, {} as Record<string, typeof resources>);

    const typeOrder = ["paper", "book", "article", "dataset", "slides"] as const;
    const sortedTypes = typeOrder.filter(t => byType[t]);

    // Sidebar stats
    const allTags = resources.flatMap(r => r.frontmatter.tags ?? []);
    const tagFreq = [...new Set(allTags)]
        .map((t) => ({ tag: t, count: allTags.filter((x) => x === t).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    const maxType = Math.max(...sortedTypes.map(t => byType[t].length), 1);

    // Year range
    const years = resources.map(r => r.frontmatter.year).filter(Boolean).sort();
    const yearRange = years.length > 0
        ? years[0] === years[years.length - 1]
            ? `${years[0]}`
            : `${years[0]}–${years[years.length - 1]}`
        : null;

    return (
        <main className="w-full">

            {/* Header — full width */}
            <div className="dot-grid px-8 md:px-16 py-20 mb-0">
                <p className="font-mono text-xs tracking-widest mb-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    [ RESOURCES.DB ] · INDEX: ACTIVE
                </p>
                <h1 className="font-display text-6xl font-bold mb-4 glow">
                    SIGNAL.ARCHIVE
                </h1>
                <p className="font-mono text-xs tracking-widest mb-8"
                   style={{ color: "var(--on-surface-variant)" }}>
                    {resources.length} ENTRIES · {sortedTypes.length} TYPES
                </p>

                {/* Type legend */}
                <div className="flex gap-6 flex-wrap">
                    {sortedTypes.map(t => (
                        <div key={t} className="flex items-center gap-2">
                            <span className="font-mono text-xs" style={{ color: typeColor[t] }}>
                                {typeSymbol[t] ?? "■"}
                            </span>
                            <span className="font-mono text-xs tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                {t.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 px-8 md:px-16 pb-24 pt-12">

                {/* ── Resource list ── */}
                <div className="min-w-0 space-y-16">
                    {sortedTypes.map(type => (
                        <div key={type} className="border-l-2 pl-6"
                             style={{ borderColor: typeColor[type] ?? "var(--outline-variant)" }}>

                            <div className="flex items-center gap-2 mb-6">
                                <span className="font-mono text-xs" style={{ color: typeColor[type] }}>
                                    {typeSymbol[type] ?? "■"}
                                </span>
                                <h2 className="font-mono text-xs tracking-widest font-bold"
                                    style={{ color: "var(--on-surface-variant)" }}>
                                    {type.toUpperCase()} ({byType[type].length})
                                </h2>
                            </div>

                            <ul>
                                {byType[type].map(resource => (
                                    <li key={resource.slug}
                                        className="group flex items-start justify-between gap-6 py-4 border-b transition-colors hover:bg-[var(--surface-container)]"
                                        style={{ borderColor: "var(--outline-variant)" }}>

                                        <div className="flex items-start gap-3 min-w-0">
                                            <span className="font-mono text-xs mt-0.5 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                                                  style={{ color: typeColor[type] }}>
                                                {typeSymbol[type] ?? "■"}
                                            </span>
                                            <div className="min-w-0">
                                                {resource.frontmatter.url ? (
                                                    <a href={resource.frontmatter.url}
                                                       target="_blank" rel="noopener noreferrer"
                                                       className="font-sans text-sm transition-colors text-[var(--on-surface)] hover:text-[var(--primary)]">
                                                        {resource.frontmatter.title}
                                                    </a>
                                                ) : (
                                                    <Link href={resource.url}
                                                          className="font-sans text-sm transition-colors text-[var(--on-surface)] hover:text-[var(--primary)]">
                                                        {resource.frontmatter.title}
                                                    </Link>
                                                )}
                                                <p className="font-mono text-xs mt-1 truncate"
                                                   style={{ color: "var(--on-surface-variant)" }}>
                                                    {resource.frontmatter.authors.join(", ")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                                {resource.frontmatter.year}
                                            </span>
                                            {resource.frontmatter.tags && resource.frontmatter.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap justify-end">
                                                    {resource.frontmatter.tags.slice(0, 3).map(tag => (
                                                        <Link key={tag} href={`/tags/${tag}`}
                                                              className="font-mono text-xs px-1.5 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                                              style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                                            {tag}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Sidebar ── */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-4">

                        {/* Type distribution */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ TYPE.DIST ]
                            </div>
                            <div className="p-3 space-y-3">
                                {sortedTypes.map(t => {
                                    const count = byType[t].length;
                                    const bars = Math.round((count / maxType) * 8);
                                    return (
                                        <div key={t}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs flex items-center gap-1"
                                                      style={{ color: typeColor[t] }}>
                                                    {typeSymbol[t] ?? "■"} {t.toUpperCase()}
                                                </span>
                                                <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="font-mono text-xs tracking-tighter" style={{ color: typeColor[t] }}>
                                                {"█".repeat(bars)}
                                                <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - bars)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Archive info */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ ARCHIVE.INFO ]
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>ENTRIES</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{resources.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>TYPES</span>
                                    <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{sortedTypes.length}</span>
                                </div>
                                {yearRange && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>YEARS</span>
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>{yearRange}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top tags */}
                        {tagFreq.length > 0 && (
                            <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                     style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                    [ TOP.TAGS ]
                                </div>
                                <div className="p-3 flex flex-wrap gap-1.5">
                                    {tagFreq.map(({ tag, count }) => (
                                        <Link key={tag} href={`/tags/${tag}`}
                                              className="font-mono text-xs px-2 py-0.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                              style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                            #{tag}
                                            {count > 1 && (
                                                <span className="ml-1" style={{ color: "var(--outline)" }}>×{count}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </aside>
            </div>
        </main>
    );
}
