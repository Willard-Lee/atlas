import {compileMDX} from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";


export async function renderMDX(source: string){
    const { content } = await compileMDX({
        source,
        options: {
            mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                    [rehypePrettyCode, { theme: "github-dark-dimmed" }]
                ]
            }
        }
    })
    return content;
}   

/* 
1. remarkGfm - enables Github-flavoured markdown (tables, strikethrough, etc.)
2. rehypeSlug - adds id attributes to headings
3. rehypeAutolinkHeadings - adds anchor links to headings
4. rehypePrettyCode - adds syntax highlighting to code blocks
*/