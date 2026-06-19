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
        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                [ RELATED ] · {links.length}
            </div>
            <ul className="divide-y" style={{ borderColor: "var(--outline-variant)" }}>
                {links.map((entry) => (
                    <li key={entry.url} className="group">
                        <Link href={entry.url}
                              className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-[var(--surface-container-high)]">
                            <span className="font-mono text-xs mt-0.5 shrink-0 transition-transform duration-150 group-hover:scale-125"
                                  style={{ color: typeColor[entry.type] ?? "var(--on-surface-variant)" }}>
                                ■
                            </span>
                            <div className="min-w-0">
                                <p className="font-sans text-xs truncate transition-colors duration-150 group-hover:text-[var(--primary)]"
                                   style={{ color: "var(--on-surface)" }}>
                                    {entry.frontmatter.title}
                                </p>
                                <p className="font-mono text-xs mt-0.5"
                                   style={{ color: typeColor[entry.type] ?? "var(--on-surface-variant)" }}>
                                    {typeLabel[entry.type] ?? entry.type.toUpperCase()}
                                </p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
