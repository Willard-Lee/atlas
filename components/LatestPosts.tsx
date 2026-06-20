import { getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

export default function LatestPosts() {
    const posts = getEntries<PostFrontmatter>("post").slice(0, 5);

    return (
        <section className="px-6 md:px-10 py-16">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="font-mono text-xs font-bold tracking-widest"
                        style={{ color: "var(--on-surface-variant)" }}>
                        [ TRANSMISSION_LOG ]
                    </h2>
                    <span className="font-mono text-xs" style={{ color: "var(--secondary-container)" }}>● LIVE</span>
                </div>
                <Link
                    href="/blog"
                    className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface-variant)" }}
                >
                    VIEW ALL →
                </Link>
            </div>

            {/* Column labels */}
            <div
                className="hidden md:flex gap-3 mb-1 pb-2 font-mono text-xs border-b"
                style={{ color: "var(--outline)", borderColor: "var(--outline-variant)" }}
            >
                <span className="w-24 shrink-0">TIMESTAMP</span>
                <span className="w-10 shrink-0">TYPE</span>
                <span>MESSAGE</span>
            </div>

            <StaggerContainer className="space-y-0">
                {posts.map((post) => {
                    const href       = post.frontmatter.external_url ?? post.url;
                    const isExternal = !!post.frontmatter.external_url;
                    return (
                    <StaggerItem key={post.slug}>
                        <Link
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="group border-b transition-colors hover:bg-[var(--surface-container)]"
                            style={{ borderColor: "var(--outline-variant)" }}
                        >
                            {/* Mobile card */}
                            <div className="md:hidden flex flex-col gap-0.5 py-3 px-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs" style={{ color: "var(--outline)" }}>
                                        {post.frontmatter.date}
                                    </span>
                                    <span className="font-mono text-xs" style={{ color: "var(--secondary-container)" }}>
                                        · [INFO]
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className="font-sans text-sm transition-colors group-hover:text-[var(--primary)]"
                                        style={{ color: "var(--on-surface)" }}
                                    >
                                        {post.frontmatter.title}
                                    </span>
                                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--primary)" }}>→</span>
                                </div>
                            </div>

                            {/* Desktop row */}
                            <div className="hidden md:flex items-baseline gap-3 py-3">
                                <span className="font-mono text-xs w-24 shrink-0" style={{ color: "var(--outline)" }}>
                                    {post.frontmatter.date}
                                </span>
                                <span className="font-mono text-xs w-10 shrink-0" style={{ color: "var(--secondary-container)" }}>
                                    INFO
                                </span>
                                <span
                                    className="font-sans text-sm truncate transition-colors group-hover:text-[var(--primary)]"
                                    style={{ color: "var(--on-surface)" }}
                                >
                                    {post.frontmatter.title}
                                </span>
                                <div className="ml-auto gap-2 shrink-0 flex">
                                    {post.frontmatter.tags?.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag}
                                            className="font-mono text-xs px-1.5 py-0.5"
                                            style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </StaggerItem>
                    );
                })}
            </StaggerContainer>

        </section>
    );
}
