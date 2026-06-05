import {getEntries} from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import Link from "next/link";


export default async function BlogPage() {
    const posts = getEntries<PostFrontmatter>("post");
    return (
        <main className = "px-16 py-24">
            <h1> Blog Page </h1>
                <ul>
                    {posts.map((post) => (
                    <li key = {post.slug}>
                        <Link href = {post.url}>
                            {post.frontmatter.title}
                        </Link>
                        <span>
                            {post.frontmatter.date}
                        </span>
                    </li>
                    ))}
                </ul>
        </main>
    )
}
