import { getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import Link from "next/link";

export default function LatestPosts(){
    const posts = getEntries<PostFrontmatter>("post").slice(0,3);
    return(
        <section className = "px-16 py-24">
            <h2 className = "text-xs font-bold tracking-widest mb-12"
                style = {{ 
                    fontFamily: "var(--font-mono)", 
                    color: "var(--on-surface-variant)"
                }}
            >
                WRITING
            </h2>
            <ul className = "space-y-6 mb-8"
                style = {{color: "var(--on-surface-variant)"}}
            >
                {posts.map((post) => (
                    <li key = {post.slug} className = "flex flex-col items-start gap-6">
                        <span className = "text-xs w-24 shrink-0"> {post.frontmatter.date} </span>
                        <Link href = {post.url} className = "text-base hover:underline">
                        {post.frontmatter.title}
                        </Link>
                        {post.frontmatter.tags && (
                            <div className = " flex gap-2">
                                {post.frontmatter.tags.map((tag) => (
                                    <span 
                                        key = {tag} 
                                        className = " text-xs px-2 py-1"
                                        style = {{fontFamily: "var(--font-mono)",
                                                background: "var(--surface-container-high)",
                                                color: "var(--on-surface-variant)"}}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <Link 
                href = "/blog" 
                className = "text-xs tracking-widest mt-8 inline-block"
                style = {{ 
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            > 
            VIEW ALL 
            </Link>
        </section>
    )
}