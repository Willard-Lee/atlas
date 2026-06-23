import { getEntries } from "@/lib/content";
import type { PostFrontmatter, NoteFrontmatter } from "@/lib/types";
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

export default function ContentFeed() {
    const posts = getEntries<PostFrontmatter>("post").slice(0, 5);
    const notes = getEntries<NoteFrontmatter>("note").slice(0, 6);

    return (
        <section className="border-t" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-5">

                {/* ── Blog: TRANSMISSIONS (left 3/5) ────────────────────── */}
                <div
                    className="lg:col-span-3 px-6 md:px-10 py-16 border-b lg:border-b-0 lg:border-r"
                    style={{ borderColor: "var(--outline-variant)" }}
                >
                    {/* Section header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="font-mono text-xs tracking-widest mb-1.5" style={{ color: "var(--outline)" }}>
                                [ 03 / TRANSMISSIONS ]
                            </p>
                            <h2
                                className="font-display font-bold leading-none"
                                style={{ color: "var(--on-surface)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
                            >
                                LATEST<br />THOUGHTS.
                            </h2>
                        </div>
                        <Link
                            href="/blog"
                            className="font-mono text-xs tracking-widest mt-1 shrink-0 transition-colors hover:text-[var(--primary)]"
                            style={{ color: "var(--on-surface-variant)" }}
                        >
                            ALL →
                        </Link>
                    </div>

                    {/* Column labels */}
                    <div
                        className="hidden md:flex gap-3 mb-1 pb-2 font-mono text-xs border-b"
                        style={{ color: "var(--outline)", borderColor: "var(--outline-variant)" }}
                    >
                        <span className="w-6 shrink-0">#</span>
                        <span className="w-24 shrink-0">DATE</span>
                        <span>TITLE</span>
                    </div>

                    {/* Post list */}
                    <StaggerContainer className="space-y-0">
                        {posts.map((post, i) => {
                            const href       = post.frontmatter.external_url ?? post.url;
                            const isExternal = !!post.frontmatter.external_url;

                            return (
                                <StaggerItem key={post.slug}>
                                    <Link
                                        href={href}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        className="group flex items-baseline gap-3 py-3.5 border-b transition-colors hover:bg-[var(--surface-container)] -mx-2 px-2"
                                        style={{ borderColor: "var(--outline-variant)" }}
                                    >
                                        {/* Index */}
                                        <span
                                            className="font-mono text-xs shrink-0 w-6"
                                            style={{ color: "var(--outline)" }}
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </span>

                                        {/* Date */}
                                        <span
                                            className="font-mono text-xs shrink-0 w-24 hidden md:block"
                                            style={{ color: "var(--outline)" }}
                                        >
                                            {post.frontmatter.date}
                                        </span>

                                        {/* Title */}
                                        <span
                                            className="font-sans text-base leading-snug flex-1 min-w-0 transition-colors group-hover:text-[var(--primary)]"
                                            style={{ color: "var(--on-surface)" }}
                                        >
                                            {post.frontmatter.title}
                                        </span>

                                        {/* Tags (desktop) */}
                                        <div className="ml-auto hidden md:flex gap-2 shrink-0">
                                            {post.frontmatter.tags?.slice(0, 1).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="font-mono text-xs px-1.5 py-0.5"
                                                    style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <span
                                            className="font-mono text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: "var(--primary)" }}
                                        >
                                            →
                                        </span>
                                    </Link>
                                </StaggerItem>
                            );
                        })}
                    </StaggerContainer>
                </div>

                {/* ── Garden: LATENT.NODES (right 2/5) ──────────────────── */}
                <div
                    className="lg:col-span-2 px-6 md:px-8 py-16"
                    style={{ background: "var(--surface-container-lowest)" }}
                >
                    {/* Section header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="font-mono text-xs tracking-widest mb-1.5" style={{ color: "var(--outline)" }}>
                                [ 04 / LATENT.NODES ]
                            </p>
                            <h2
                                className="font-display font-bold leading-none"
                                style={{ color: "var(--on-surface)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
                            >
                                THE<br />GARDEN.
                            </h2>
                        </div>
                        <Link
                            href="/garden"
                            className="font-mono text-xs tracking-widest mt-1 shrink-0 transition-colors hover:text-[var(--primary)]"
                            style={{ color: "var(--on-surface-variant)" }}
                        >
                            EXPLORE →
                        </Link>
                    </div>

                    {/* Tree root */}
                    <div
                        className="font-mono text-xs mb-2 pb-2 border-b"
                        style={{ color: "var(--outline)", borderColor: "var(--outline-variant)" }}
                    >
                        /garden/ — {notes.length} nodes
                    </div>

                    {/* Note tree */}
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
                                            className="font-sans text-sm truncate flex-1 transition-colors group-hover:text-[var(--primary)]"
                                            style={{ color: "var(--on-surface)" }}
                                        >
                                            {note.frontmatter.title}
                                        </span>
                                        <span
                                            className="ml-auto font-mono text-xs shrink-0 hidden sm:block"
                                            style={{ color: "var(--on-surface-variant)" }}
                                        >
                                            {note.frontmatter.subject.toUpperCase().slice(0, 4)}
                                        </span>
                                    </Link>
                                </StaggerItem>
                            );
                        })}
                    </StaggerContainer>

                    {/* Garden footer note */}
                    <div className="mt-6 pt-4 border-t font-mono text-xs leading-loose" style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}>
                        <span style={{ color: "#facc15" }}>◌ seed</span> · growing &nbsp;
                        <span style={{ color: "#00dbe9" }}>◎ budd</span> · forming &nbsp;
                        <span style={{ color: "#4ade80" }}>● ever</span> · mature
                    </div>
                </div>
            </div>
        </section>
    );
}
