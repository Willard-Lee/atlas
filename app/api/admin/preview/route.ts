import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import { toHtml } from "hast-util-to-html";
import type { Root } from "hast";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPlugin = any;

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype as AnyPlugin, { allowDangerousHtml: true })
    .use(rehypeSlug as AnyPlugin)
    .use(rehypeKatex as AnyPlugin);

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { body } = await req.json() as { body: string };
    if (!body?.trim()) return NextResponse.json({ html: "" });

    try {
        const mdast = processor.parse(body);
        const hast  = await processor.run(mdast) as Root;
        const html  = toHtml(hast, { allowDangerousHtml: true });
        return NextResponse.json({ html });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
