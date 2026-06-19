import { getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

const maturityColor: Record<string, string> = {
    seedling:  "#facc15",
    budding:   "#00dbe9",
    evergreen: "#4ade80",
};

const maturityLabel: Record<string, string> = {
    seedling:  "seed",
    budding:   "budd",
    evergreen: "ever",
};

export default function GardenTeaser() {
    const notes = getEntries<NoteFrontmatter>("note").slice(0, 5);

    return (
        <section
            className="px-6 md:px-8 py-16 border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: "var(--outline-variant)" }}
        >

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: "var(--on-surface-variant)" }}>
                    [ LATENT.NODES ]
                </h2>
                <Link
                    href="/garden"
                    className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface-variant)" }}
                >
                    EXPLORE →
                </Link>
            </div>

            {/* Tree root */}
            <div className="font-mono text-xs mb-2 pb-2 border-b" style={{ color: "var(--outline)", borderColor: "var(--outline-variant)" }}>
                /garden/
            </div>

            <StaggerContainer className="space-y-0">
                {notes.map((note, i) => {
                    const isLast = i === notes.length - 1;
                    const color  = maturityColor[note.frontmatter.maturity] ?? "var(--on-surface-variant)";
                    const label  = maturityLabel[note.frontmatter.maturity] ?? "??";

                    return (
                        <StaggerItem key={note.slug}>
                            <Link
                                href={note.url}
                                className="group flex items-center gap-3 py-3 border-b transition-colors hover:bg-[var(--surface-container)]"
                                style={{ borderColor: "var(--outline-variant)" }}
                            >
                                <span className="font-mono text-xs shrink-0 w-5" style={{ color: "var(--outline)" }}>
                                    {isLast ? "└─" : "├─"}
                                </span>
                                <span
                                    className="font-mono text-xs shrink-0 px-1.5 py-0.5"
                                    style={{ color, border: `1px solid ${color}`, opacity: 0.9 }}
                                >
                                    {label}
                                </span>
                                <span
                                    className="font-sans text-sm truncate transition-colors group-hover:text-[var(--primary)]"
                                    style={{ color: "var(--on-surface)" }}
                                >
                                    {note.frontmatter.title}
                                </span>
                                <span className="ml-auto font-mono text-xs shrink-0 hidden sm:block"
                                      style={{ color: "var(--on-surface-variant)" }}>
                                    {note.frontmatter.subject.toUpperCase()}
                                </span>
                            </Link>
                        </StaggerItem>
                    );
                })}
            </StaggerContainer>

        </section>
    );
}
