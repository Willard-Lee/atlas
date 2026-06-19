import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const filePath = req.nextUrl.searchParams.get("path");
    if (!filePath) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    // Guard against path traversal — must be inside content/
    const abs = path.resolve(process.cwd(), filePath);
    const contentRoot = path.resolve(process.cwd(), "content");
    if (!abs.startsWith(contentRoot))
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });

    if (!fs.existsSync(abs))
        return NextResponse.json({ error: "File not found" }, { status: 404 });

    const raw = fs.readFileSync(abs, "utf-8");
    const { data, content } = matter(raw);
    return NextResponse.json({ frontmatter: data, body: content.trimStart() });
}
