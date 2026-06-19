import { getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerContainer";

export default function LatestPosts() {
    const posts = getEntries<PostFrontmatter>("post").slice(0, 3);

    return (
        <section className="px-16 py-24 border-t" style={{ borderColor: "var(--outline-variant)" }}>
            <div className="flex items-center justify-between mb-12">
                <h2 className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: "var(--on-surface-variant)" }}>
                    [ TRANSMISSION_LOG ]
                </h2>
                <Link href="/blog"
                      className="font-mono text-xs tracking-widest transition-colors hover:text-[var(--primary)]"
                      style={{ color: "var(--on-surface-variant)" }}>
                    VIEW ALL →
                </Link>
            </div>

            <StaggerContainer className="space-y-0">
                {posts.map((post) => (
                    <StaggerItem key={post.slug}>
                        <div className="flex items-baseline justify-between gap-4 py-4 border-b"
                             style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="flex items-baseline gap-4 min-w-0">
                                <span className="font-mono text-xs shrink-0 w-24"
                                      style={{ color: "var(--on-surface-variant)" }}>
                                    {post.frontmatter.date}
                                </span>
                                <Link href={post.url}
                                      className="font-sans text-sm truncate transition-colors text-[var(--on-surface)] hover:text-[var(--primary)]">
                                    {post.frontmatter.title}
                                </Link>
                            </div>
                            {post.frontmatter.tags && post.frontmatter.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="font-mono text-xs px-2 py-0.5 shrink-0 hidden sm:inline"
                                      style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </section>
    );
}
