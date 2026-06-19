import { getEntries } from "@/lib/content";
import type { NoteFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

const maturityColor: Record<string, string> = {
    seedling:  "#facc15",
    budding:   "#00dbe9",
    evergreen: "#4ade80",
};

export default function GardenTeaser() {
    const notes = getEntries<NoteFrontmatter>("note").slice(0, 3);

    return (
        <section className="px-16 py-24 border-t" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="flex items-center justify-between mb-12">
                <h2 className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: "var(--on-surface-variant)" }}>
                    [ LATENT.NODES ]
                </h2>
                <Link href="/garden"
                      className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                      style={{ color: "var(--on-surface-variant)" }}>
                    EXPLORE GARDEN →
                </Link>
            </div>

            <StaggerContainer className="space-y-0">
                {notes.map((note) => (
                    <StaggerItem key={note.slug}>
                        <div className="flex items-center justify-between gap-4 py-4 border-b"
                             style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="font-mono text-xs shrink-0"
                                      style={{ color: maturityColor[note.frontmatter.maturity] }}>■</span>
                                <Link href={note.url}
                                      className="font-sans text-sm truncate transition-colors text-[var(--on-surface)] hover:text-[var(--primary)]">
                                    {note.frontmatter.title}
                                </Link>
                            </div>
                            <span className="font-mono text-xs shrink-0 tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                {note.frontmatter.subject.toUpperCase()}
                            </span>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </section>
    );
}
