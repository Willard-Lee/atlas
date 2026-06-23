import { relatedFor } from "@/lib/graph";
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

export default function Related({ url }: { url: string }) {
    const links = relatedFor(url);
    if (links.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs tracking-widest shrink-0"
                      style={{ color: "var(--outline)" }}>
                    RELATED.NODES
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                <span className="font-mono text-xs shrink-0"
                      style={{ color: "var(--outline)" }}>
                    {links.length}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((entry) => {
                    const color = typeColor[entry.type] ?? "var(--on-surface-variant)";
                    const label = typeLabel[entry.type] ?? entry.type.toUpperCase();
                    return (
                        <Link
                            key={entry.url}
                            href={entry.url}
                            className="group flex flex-col gap-3 p-4 border transition-colors hover:border-[var(--primary)]"
                            style={{ borderColor: "var(--outline-variant)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs tracking-widest"
                                      style={{ color }}>
                                    ■ {label}
                                </span>
                                <span className="font-mono text-xs transition-transform duration-150 group-hover:translate-x-1"
                                      style={{ color: "var(--outline)" }}>
                                    →
                                </span>
                            </div>
                            <p className="font-sans text-sm leading-snug transition-colors duration-150 group-hover:text-[var(--primary)]"
                               style={{ color: "var(--on-surface)" }}>
                                {entry.frontmatter.title}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
