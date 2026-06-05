import { getAllEntries } from "@/lib/content";

export const dynamic = "force-static"; // force-static tells next.js to generate this as a static JSON file at build time.

export function GET() {
    return Response.json(
        getAllEntries().map((e) => ({
            title: e.frontmatter.title,
            url: e.url,
            type: e.type,
            tags: e.frontmatter.tags ?? [],
            summary: e.frontmatter.summary?? "",
        }))
    );
}

