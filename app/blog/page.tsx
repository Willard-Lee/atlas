import {getEntries} from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import BlogGrid from "@/components/BlogGrid";

export default async function BlogPage() {
    const posts = getEntries<PostFrontmatter>("post");
    return (
        <main className = "px-16 py-24 mx-auto max-w-6xl">
           <h1 className = "text-5xl font-bold mb-2 leading-tight"
            style = {{ fontFamily: "var(--font-display)"}}
            >
                TRANSMISSION_LOG
            </h1>
            <p className = " text-xs tracking-widest mb-12"
                style = {{
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            >
                LOG_ARCHIVE: ACTIVE
            </p>
            <BlogGrid posts = {posts}/>
        </main>
    )
}
