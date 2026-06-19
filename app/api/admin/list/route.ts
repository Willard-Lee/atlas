import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");
const TYPE_DIRS: Record<string, string> = {
    blog: "blog", project: "projects", garden: "garden", resource: "resources",
};

function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const full = path.join(dir, d.name);
        return d.isDirectory() ? walk(full) : d.name.endsWith(".mdx") ? [full] : [];
    });
}

export async function GET() {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items = Object.entries(TYPE_DIRS).flatMap(([type, dir]) =>
        walk(path.join(ROOT, dir)).map((filePath) => {
            const raw = fs.readFileSync(filePath, "utf-8");
            const { data } = matter(raw);
            const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
            return {
                type,
                slug: path.basename(filePath, ".mdx"),
                filePath: relative,
                frontmatter: {
                    title:   data.title   ?? "(untitled)",
                    date:    data.date    ?? "",
                    draft:   data.draft   ?? false,
                    subject: data.subject ?? null,
                },
            };
        })
    ).sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));

    return NextResponse.json({ items });
}
