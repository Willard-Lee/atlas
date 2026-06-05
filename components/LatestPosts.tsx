import { getEntries } from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import Link from "next/link";

export default function LatestPosts(){
    const posts = getEntries<PostFrontmatter>("post").slice(0,3);
    return(
        <section className = "px-16 py-24">
            <h2>
                Writing
            </h2>
            <ul>
                {posts.map((post) => (
                    <li key = {post.slug}>
                        <span> {post.frontmatter.date} </span>
                        <Link href = {post.url}>
                        {post.frontmatter.title}
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href = "/blog"> View all </Link>
        </section>
    )
}