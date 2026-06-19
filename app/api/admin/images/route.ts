import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_DIR = path.join(process.cwd(), "public", "images");
const ALLOWED   = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);

export async function GET() {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({}, { status: 404 });

    if (!fs.existsSync(IMAGE_DIR))
        return NextResponse.json({ images: [] });

    const files = fs.readdirSync(IMAGE_DIR)
        .filter((f) => ALLOWED.has(path.extname(f).toLowerCase()))
        .map((f) => ({
            name: f,
            path: `/images/${f}`,
            mtime: fs.statSync(path.join(IMAGE_DIR, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtime - a.mtime);

    return NextResponse.json({ images: files });
}
