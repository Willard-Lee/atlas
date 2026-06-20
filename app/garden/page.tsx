import { getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import Link from "next/link";

const maturityColor: Record<string, string> = {
    seedling:  "#facc15",
    budding:   "#00dbe9",
    evergreen: "#4ade80",
};

export default async function GardenPage() {
    const notes = getEntries<NoteFrontmatter>("note");

    const bySubject = notes.reduce((acc, note) => {
        const s = note.frontmatter.subject;
        if (!acc[s]) acc[s] = [];
        acc[s].push(note);
        return acc;
    }, {} as Record<string, typeof notes>);

    // Sidebar stats
    const maturitiesAll = ["seedling", "budding", "evergreen"] as const;
    const maturityCounts = maturitiesAll.map((m) => ({
        m, count: notes.filter((n) => n.frontmatter.maturity === m).length,
    }));
    const maxMat = Math.max(...maturityCounts.map((x) => x.count), 1);

    const allTags = notes.flatMap((n) => n.frontmatter.tags ?? []);
    const tagFreq = [...new Set(allTags)]
        .map((t) => ({ tag: t, count: allTags.filter((x) => x === t).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    return (
        <main className="w-full">

            {/* Header — full width */}
            <div className="dot-grid px-4 sm:px-8 md:px-16 py-12 md:py-20 mb-0">
                <p className="font-mono text-xs tracking-widest mb-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    [ GARDEN.DB ] · NODES: ACTIVE
                </p>
                <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold mb-4 glow">
                    LATENT.NODES
                </h1>
                <p className="font-mono text-xs tracking-widest mb-8"
                   style={{ color: "var(--on-surface-variant)" }}>
                    {notes.length} NODES · {Object.keys(bySubject).length} SUBJECTS
                </p>

                {/* Maturity legend */}
                <div className="flex gap-6">
                    {maturitiesAll.map((m) => (
                        <div key={m} className="flex items-center gap-2">
                            <span className="font-mono text-xs" style={{ color: maturityColor[m] }}>■</span>
                            <span className="font-mono text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                                {m.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 px-4 sm:px-8 md:px-16 pb-24 pt-12">

                {/* ── Note list ── */}
                <div className="min-w-0 space-y-16">
                    {Object.entries(bySubject).map(([subject, entries]) => (
                        <div key={subject} className="border-l-2 pl-6"
                             style={{ borderColor: "var(--outline-variant)" }}>

                            <h2 className="font-mono text-xs tracking-widest font-bold mb-6"
                                style={{ color: "var(--on-surface-variant)" }}>
                                {subject.toUpperCase()} ({entries.length})
                            </h2>

                            <ul className="space-y-0">
                                {entries.map((note) => (
                                    <li key={note.slug}
                                        className="group flex items-center justify-between gap-4 py-3 border-b transition-colors hover:bg-[var(--surface-container)]"
                                        style={{ borderColor: "var(--outline-variant)" }}>

                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="font-mono text-xs flex-shrink-0 transition-transform duration-150 group-hover:scale-125"
                                                  style={{ color: maturityColor[note.frontmatter.maturity] }}>
                                                ■
                                            </span>
                                            <Link href={note.url}
                                                  className="font-sans text-sm truncate transition-colors text-[var(--on-surface)] group-hover:text-[var(--primary)]">
                                                {note.frontmatter.title}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <span className="hidden sm:inline font-mono text-xs tracking-widest"
                                                  style={{ color: maturityColor[note.frontmatter.maturity] }}>
                                                {note.frontmatter.maturity.toUpperCase()}
                                            </span>
                                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                                {note.frontmatter.date}
                                            </span>
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

                        {/* Maturity distribution */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ MATURITY.DIST ]
                            </div>
                            <div className="p-3 space-y-3">
                                {maturityCounts.map(({ m, count }) => {
                                    const bars = Math.round((count / maxMat) * 8);
                                    return (
                                        <div key={m}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-xs flex items-center gap-1.5"
                                                      style={{ color: maturityColor[m] }}>
                                                    ■ {m.toUpperCase()}
                                                </span>
                                                <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="font-mono text-xs tracking-tighter" style={{ color: maturityColor[m] }}>
                                                {"█".repeat(bars)}
                                                <span style={{ color: "var(--outline-variant)" }}>{"░".repeat(8 - bars)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Subjects */}
                        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                                [ SUBJECTS ]
                            </div>
                            <div className="divide-y" style={{ borderColor: "var(--outline-variant)" }}>
                                {Object.entries(bySubject).map(([subject, entries]) => (
                                    <div key={subject} className="flex items-center justify-between px-3 py-2">
                                        <span className="font-mono text-xs" style={{ color: "var(--on-surface)" }}>
                                            {subject.toUpperCase()}
                                        </span>
                                        <span className="font-mono text-xs px-1.5 py-0.5"
                                              style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
                                            {entries.length}
                                        </span>
                                    </div>
                                ))}
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
