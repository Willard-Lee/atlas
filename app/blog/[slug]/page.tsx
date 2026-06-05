import { getEntry, getEntries} from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound} from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related"

export async function generateStaticParams() { /* this fucntion tells Next.js which slugs to pre-render at build time. */
    return getEntries<PostFrontmatter>("post").map((post) => ({
        slug: post.slug,
    }))
}

export default async function BlogPostPage({ params}: {params: Promise<{slug: string}>}) { 
    const { slug } = await params;
    const post = getEntry<PostFrontmatter>("post", slug); 
    if(!post) notFound(); /* Throws a 404 page if the slug doesn't exist */

    const content = await renderMDX(post.raw);

    return (
        <main className = "px-16 py-24 max-w-2xl">
            <h1>{post.frontmatter.title}</h1>
            <p>{post.frontmatter.date}</p>
            <article>{content}</article>
            <Backlinks url = {post.url}/>
            <Related url = {post.url}/>
        </main>
    );
}

