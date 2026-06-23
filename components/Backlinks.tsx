import { backlinksFor } from "@/lib/graph";
import Link from "next/link";

export default function Backlinks({ url }: { url: string }) {
    const links = backlinksFor(url);
    if (links.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs tracking-widest shrink-0"
                      style={{ color: "var(--outline)" }}>
                    REFERENCED.BY
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                <span className="font-mono text-xs shrink-0"
                      style={{ color: "var(--outline)" }}>
                    {links.length}
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                {links.map((entry) => (
                    <Link
                        key={entry.url}
                        href={entry.url}
                        className="group flex items-center gap-3 px-4 py-3 border transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)]"
                        style={{ borderColor: "var(--outline-variant)" }}
                    >
                        <span className="font-mono text-sm shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
                              style={{ color: "var(--primary)" }}>
                            ←
                        </span>
                        <span className="font-sans text-sm flex-1 truncate transition-colors duration-150 group-hover:text-[var(--primary)]"
                              style={{ color: "var(--on-surface)" }}>
                            {entry.frontmatter.title}
                        </span>
                        <span className="font-mono text-xs shrink-0 tracking-widest"
                              style={{ color: "var(--outline)" }}>
                            BACKLINK
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
