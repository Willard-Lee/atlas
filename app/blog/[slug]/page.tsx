import { getEntry, getEntries} from "@/lib/content";
import type { PostFrontmatter } from "@/lib/types";
import { renderMDX } from "@/lib/mdx";
import { notFound} from "next/navigation";
import Backlinks from "@/components/Backlinks";
import Related from "@/components/Related"
import { CATEGORIES, getCategory} from "@/lib/categories"

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
    const readingTime = Math.ceil(post.raw.split(/\s+/).length/200)
    const cat = getCategory(post.frontmatter.tags)
    const catData = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null
    return (
        <main className = "px-16 py-24 max-w-3xl mx-auto">
            {post.frontmatter.cover && (
                <img src = {post.frontmatter.cover} alt = "" 
                    className = {`w-full object-cover mb-12 ${cat === "photography" ? " h-96" : "h-64"}`}
                />
            )}
            {catData && (
                <span className = "text-xs font-bold tracking-widest mb-4 block"
                    style = {{ fontFamily: "var(--font-mono)", color: catData.color}}
                >
                    {catData.symbol} {catData.label}
                </span>
            )}
            <h1
                className = "text-5xl font-bold mb-2"
                style = {{ fontFamily : "var(--font-display)"}}
            >
                {post.frontmatter.title}
            </h1>
            <p
                className = "text-xs mb-8"
                style = {{
                    fontFamily: "var(--font-mono)",
                    color: "var(--on-surface-variant)"
                }}
            >
                {post.frontmatter.date} · {readingTime} min read
            </p>
                

            <article className = "prose ">{content}</article>
            <Backlinks url = {post.url}/>
            <Related url = {post.url}/>
        </main>
    );
}

/*
  The blog detail is almost identical to app/projects/[slug]/page.tsx with these differences:
  - No statusColor map — use CATEGORIES instead for the badge
  - Badge shows {symbol} {label} based on the post's category tag
  - No stack chips
  - No Demo/Repo buttons
  - Cover image height: h-96 for photography, h-64 for everything else

  Open app/projects/[slug]/page.tsx side by side as reference. Start by adding readingTime, the CATEGORIES object, and
  getCategory helper above the return. Go for it.
*/