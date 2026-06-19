import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { filePath } = await req.json() as { filePath: string };
    if (!filePath) return NextResponse.json({ error: "Missing filePath" }, { status: 400 });

    const abs = path.resolve(process.cwd(), filePath);
    const contentRoot = path.resolve(process.cwd(), "content");
    if (!abs.startsWith(contentRoot))
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });

    if (!fs.existsSync(abs))
        return NextResponse.json({ error: "File not found" }, { status: 404 });

    fs.unlinkSync(abs);
    return NextResponse.json({ deleted: filePath });
}
