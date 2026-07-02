import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(req: NextRequest) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { filePath, fields, mdxBody } = await req.json() as {
        filePath: string;
        fields: Record<string, string | string[] | boolean | number>;
        mdxBody: string;
    };

    if (!filePath) return NextResponse.json({ error: "Missing filePath" }, { status: 400 });

    const abs = path.resolve(process.cwd(), filePath);
    const contentRoot = path.resolve(process.cwd(), "content");
    if (!abs.startsWith(contentRoot + path.sep))
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });

    if (!fs.existsSync(abs))
        return NextResponse.json({ error: "File not found" }, { status: 404 });

    const lines: string[] = ["---"];
    for (const [k, v] of Object.entries(fields)) {
        if (v === "" || v === undefined || v === null) continue;
        if (Array.isArray(v))         lines.push(`${k}: [${v.map((s) => `"${s}"`).join(", ")}]`);
        else if (typeof v === "boolean") lines.push(`${k}: ${v}`);
        else if (typeof v === "number")  lines.push(`${k}: ${v}`);
        else                             lines.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`);
    }
    lines.push("---", "", mdxBody ?? "");

    fs.writeFileSync(abs, lines.join("\n"), "utf-8");
    return NextResponse.json({ path: filePath });
}
