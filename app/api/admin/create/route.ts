import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TYPE_DIR: Record<string, string> = {
    blog: "blog", project: "projects", resource: "resources",
};

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { type, slug, fields, mdxBody } = await req.json() as {
        type: "blog" | "project" | "garden" | "resource";
        slug: string;
        fields: Record<string, string | string[] | boolean | number>;
        mdxBody: string;
    };

    if (!type || !slug) return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });

    const contentRoot = path.resolve(process.cwd(), "content");
    let filePath: string;

    if (type === "garden") {
        const subject = (fields.subject as string) ?? "general";
        filePath = path.join(contentRoot, "garden", subject, `${slug}.mdx`);
    } else {
        filePath = path.join(contentRoot, TYPE_DIR[type], `${slug}.mdx`);
    }

    // Guard against path traversal via crafted slug or subject
    if (!path.resolve(filePath).startsWith(contentRoot))
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });

    if (type === "garden") fs.mkdirSync(path.dirname(filePath), { recursive: true });

    if (fs.existsSync(filePath))
        return NextResponse.json({ error: `File already exists: ${path.relative(process.cwd(), filePath).replace(/\\/g, "/")}` }, { status: 409 });

    // Build YAML frontmatter
    const lines: string[] = ["---"];
    for (const [k, v] of Object.entries(fields)) {
        if (v === "" || v === undefined || v === null) continue;
        if (Array.isArray(v)) {
            lines.push(`${k}: [${v.map((s) => `"${s}"`).join(", ")}]`);
        } else if (typeof v === "boolean") {
            lines.push(`${k}: ${v}`);
        } else if (typeof v === "number") {
            lines.push(`${k}: ${v}`);
        } else {
            lines.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`);
        }
    }
    lines.push("---", "", mdxBody ?? "");

    fs.writeFileSync(filePath, lines.join("\n"), "utf-8");

    const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    return NextResponse.json({ path: relative });
}
