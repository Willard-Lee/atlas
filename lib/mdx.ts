import {compileMDX} from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkWikiLink } from "./graph";
import Instagram from "@/components/embeds/Instagram";
import Tweet from "@/components/embeds/Tweet";
import LinkCard from "@/components/embeds/LinkCard";
import Embed from "@/components/embeds/Embed";

// MDX components available to author inside any post body.
const mdxComponents = { Instagram, Tweet, LinkCard, Embed };

const calloutTypes: Record<string, string> = {
    note: "NOTE", warning: "WARNING", tip: "TIP",
    important: "IMPORTANT", caution: "CAUTION",
};

// Turn ```mermaid fences into inert <div class="mermaid">…source…</div> nodes.
// MUST run BEFORE rehypePrettyCode so pretty-code never syntax-highlights them.
// A client <MermaidRunner> renders these divs to SVG after hydration.
function rehypeMermaid() {
    return (tree: any) => {
        function walk(node: any) {
            node.children?.forEach(walk);

            if (node.type !== "element" || node.tagName !== "pre") return;

            const code = node.children?.find((c: any) => c.type === "element" && c.tagName === "code");
            const className: string[] = code?.properties?.className ?? [];
            if (!className.includes("language-mermaid")) return;

            const source = (code.children ?? [])
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.value)
                .join("");

            node.tagName = "div";
            node.properties = { className: ["mermaid"] };
            node.children = [{ type: "text", value: source }];
        }
        walk(tree);
    };
}

function rehypeCallouts() {
    return (tree: any) => {
        function walk(node: any) {
            // Recurse into children first so nested blockquotes are always processed
            node.children?.forEach(walk);

            if (node.type !== "element" || node.tagName !== "blockquote") return;

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

            // Strip the [!TYPE] marker from the first text node, then rebuild children.
            // Use flatMap so we can both filter and transform in one pass (avoids
            // returning a node object from inside .filter(), which only expects booleans).
            firstText.value = title;
            node.children = [
                titleEl,
                ...node.children.flatMap((c: any) => {
                    if (c !== firstP) return [c];
                    // Drop the leading [!TYPE] paragraph entirely if there's no inline title text,
                    // otherwise keep the paragraph with its remaining children.
                    const rest = c.children.slice(1);
                    return rest.length > 0 ? [{ ...c, children: rest }] : [];
                }),
            ];
        }
        walk(tree);
    };
}

export async function renderMDX(source: string){
    const { content } = await compileMDX({
        source,
        components: mdxComponents,
        options: {
            mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath, remarkWikiLink],
                rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                    rehypeKatex,
                    rehypeMermaid,   // must precede rehypePrettyCode
                    [rehypePrettyCode, { theme: "github-dark-dimmed" }],
                    rehypeCallouts,
                ]
            }
        }
    })
    return content;
}   

