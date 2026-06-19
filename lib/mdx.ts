import {compileMDX} from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkWikiLink } from "./graph";

const calloutTypes: Record<string, string> = {
    note: "NOTE", warning: "WARNING", tip: "TIP",
    important: "IMPORTANT", caution: "CAUTION",
};

function rehypeCallouts() {
    return (tree: any) => {
        function walk(node: any) {
            if (node.type === "element" && node.tagName === "blockquote") {
                const firstP = node.children?.find((c: any) => c.type === "element" && c.tagName === "p");
                const firstText = firstP?.children?.find((c: any) => c.type === "text");
                if (!firstText) return;

                const match = firstText.value.match(/^\[!(\w+)\]([\s\S]*)/);
                if (!match) return;

                const type = match[1].toLowerCase();
                if (!calloutTypes[type]) return;

                const title = match[2].replace(/^\n/, "").trim();
                node.properties = { ...(node.properties ?? {}), className: [`callout`, `callout-${type}`] };

                const titleEl = {
                    type: "element", tagName: "div",
                    properties: { className: ["callout-title"] },
                    children: [{ type: "text", value: calloutTypes[type] + (title ? ` — ${title}` : "") }],
                };
                firstText.value = title || "";
                node.children = [titleEl, ...node.children.filter((c: any) => c !== firstP || title
                    ? (c === firstP ? { ...c, children: c.children.slice(1) } : c)
                    : false
                ).filter(Boolean)];
            }
            node.children?.forEach(walk);
        }
        walk(tree);
    };
}

export async function renderMDX(source: string){
    const { content } = await compileMDX({
        source,
        options: {
            mdxOptions: {
                remarkPlugins: [remarkGfm, remarkWikiLink],
                rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                    [rehypePrettyCode, { theme: "github-dark-dimmed" }],
                    rehypeCallouts,
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