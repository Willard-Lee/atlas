import { backlinksFor } from "@/lib/graph";
import Link from "next/link";

export default function Backlinks({ url }: { url: string }) {
    const links = backlinksFor(url);
    if (links.length === 0) return null;

    return (
        <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="px-3 py-2 border-b font-mono text-xs tracking-widest"
                 style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", background: "var(--surface-container)" }}>
                [ BACKLINKS ] · {links.length}
            </div>
            <ul className="divide-y" style={{ borderColor: "var(--outline-variant)" }}>
                {links.map((entry) => (
                    <li key={entry.url} className="group">
                        <Link href={entry.url}
                              className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-[var(--surface-container-high)]">
                            <span className="font-mono text-xs transition-transform duration-150 group-hover:-translate-x-0.5"
                                  style={{ color: "var(--primary)" }}>←</span>
                            <span className="font-sans text-xs truncate transition-colors duration-150 group-hover:text-[var(--primary)]"
                                  style={{ color: "var(--on-surface)" }}>
                                {entry.frontmatter.title}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
