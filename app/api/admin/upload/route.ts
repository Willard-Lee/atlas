import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);
const MAX_BYTES    = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_BYTES)
        return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });

    const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
    const ext  = path.extname(safe).toLowerCase();
    if (!ALLOWED_EXT.has(ext))
        return NextResponse.json({ error: `File type not allowed: ${ext}` }, { status: 400 });

    const dir  = path.join(process.cwd(), "public", "images");
    fs.mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, safe), buffer);

    return NextResponse.json({ path: `/images/${safe}` });
}
