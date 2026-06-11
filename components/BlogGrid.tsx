"use client"

import { useState } from "react";
import type { Entry, PostFrontmatter } from "@/lib/types"
import Link from "next/link";
import { CATEGORIES, getCategory} from "@/lib/categories"


type Props = {
    posts: Entry<PostFrontmatter>[]
}

export default function BlogGrid({ posts }: Props) {
    const [filter, setFilter ] = useState<string>("all")
    const filtered = filter === "all" ? posts : posts.filter(p => p.frontmatter.tags?.includes(filter))

    return(
        <div>
            <div className = "flex items-center justify-between mb-8">
                <div className = "flex gap-2">
                    <button onClick = {() => setFilter("all")}
                            className = "text-xs px-3 py-1 tracking-widest"
                            style = {{
                                fontFamily: "var(--font-mono)",
                                background: filter === "all" ? "var(--primary-container)" : "var(--surface-container-high)",
                                color: filter === "all" ? "var(--on-primary-container)" : "var(--on-surface-variant)"
                            }}
                    >
                        ALL
                    </button>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                        <button key={key} onClick ={() => setFilter(key)}
                            className = "text-xs px-3 py-1 tracking-widest"
                            style = {{ 
                                fontFamily: "var(--font-mono)",
                                background: filter === key ? cat.color : "var(--surface-container-high)",
                                color: filter === key ? "var(--surface)" : "var(--on-surface-variant)"
                            }} 
                        >
                            {cat.symbol} {cat.label}
                        </button>
                    )) }
                </div>
                <span className = "text-xs"
                    style = {{
                        fontFamily: "var(--font-mono)",
                        color: "var(--on-surface-variant)"
                    }}
                >
                    SCANNING {posts.length} ENTRIES
                </span>
                
            </div>

            {/* Featured Post*/}
            {filtered[0] && (() => {
                const post = filtered[0];
                const cat = getCategory(post.frontmatter.tags)
                const catData = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null
                const readingTime = Math.ceil(post.raw.split(/\s+/).length/200 )
                
                return (
                    <Link href = {post.frontmatter.external_url ?? post.url}
                        className = "grid grid-cols-2 mb-12 transition-colors"
                        style =  {{ border: "1px solid var(--outline-variant)"}}
                    >
                        <div className = "h-64 w-full" 
                            style = {{background: "var(--surface-container-high)"}}
                        >
                            {post.frontmatter.cover && <img src = {post.frontmatter.cover} alt = "" className = "w-full h-full object-cover"/>}
                        </div>
                        <div className = "p-6">
                            <p className = "text-xs mb-4"
                                style = {{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--on-surface-variant)",
                                }}
                            >
                                LATEST_TRANSMISSION
                            </p>
                            <h2 className = "text-3xl font-bold mb-3"
                                style = {{ fontFamily: "var(--font-display)"}}
                            >
                                {post.frontmatter.title}
                            </h2>
                            {post.frontmatter.summary &&
                                <p className = "text-sm mb-4"
                                    style = {{color: "var(--on-surface-variant)"}}
                                >
                                    {post.frontmatter.summary}
                                </p>
                            }
                            <p className = "text-xs"
                                style = {{
                                    fontFamily: "var(--font-mono)",
                                    color: catData?.color ?? "var(--on-surface-variant)"
                                }}
                            >
                                {catData?.symbol} {catData?.label} · {readingTime} MIN READ

                            </p>
                        </div>


                    </Link>
                )
            }) ()}
            {/* Card Grid*/}
             <div className="grid grid-cols-3 gap-6">
                {filtered.slice(1).map((post, i) => {
                    const cat = getCategory(post.frontmatter.tags)
                    const catData = cat ? CATEGORIES[cat as keyof typeof CATEGORIES] : null
                    const readingTime = Math.ceil(post.raw.split(/\s+/).length / 200)
                    return (
                        <Link
                            key={post.slug}
                            href={post.frontmatter.external_url ?? post.url}
                            className="p-4 transition-colors"
                            style={{
                                border: "1px solid var(--outline-variant)",
                                borderLeft: `2px solid ${catData?.color ?? "var(--outline-variant)"}`,
                            }}
                        >
                            <div className="flex justify-between mb-3">
                                <span className="text-xs" style={{ fontFamily:"var(--font-mono)", color: "var(--on-surface-variant)" }}>
                                    ARCHIVE_{post.frontmatter.date.replace(/-/g, ".")}
                                </span>
                                <span className="text-xs" 
                                    style={{ 
                                        fontFamily: "var(--font-mono)", 
                                        color: catData?.color ??"var(--on-surface-variant)" 
                                    }}
                                >
                                    {catData?.symbol} {catData?.label}
                                </span>
                            </div>
                            <h3 className="font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                                {post.frontmatter.title}
                            </h3>
                            {post.frontmatter.summary && (
                                <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--on-surface-variant)" }}>
                                    {post.frontmatter.summary}
                                </p>
                            )}
                            <div className="flex justify-between">
                                <span className="text-xs" 
                                    style={{ 
                                        fontFamily: "var(--font-mono)", 
                                        color: "var(--on-surface-variant)" 
                                    }}
                                >
                                        LOG_00{i + 2}
                                </span>
                                <span className="text-xs" 
                                    style={{ 
                                        fontFamily:"var(--font-mono)", 
                                        color: "var(--on-surface-variant)" 
                                        }}
                                    >
                                    {readingTime} MIN READ
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

