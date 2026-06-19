import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentType, Entry, BaseFrontmatter } from "./types";

const ROOT = path.join(process.cwd(), "content");
const DIR: Record<ContentType, string> = {
    project: "projects",
    post:    "blog",
    note:    "garden",
    resource:"resources",
};
const PREFIX: Record<ContentType, string> = {
    project : "/projects",
    post : "/blog",
    note: "/garden",
    resource : "/resources",
};

function walk(dir: string): string[]{
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, {withFileTypes: true}).flatMap((d) => {
        const full = path.join(dir, d.name);
        return d.isDirectory() ? walk(full) : d.name.endsWith(".mdx") ? [full] : [];
    });
}

export function getEntries<F = Record<string, unknown>>(type: ContentType): Entry<F>[] {
    const isDev = process.env.NODE_ENV === "development";
    return walk(path.join(ROOT, DIR[type])).map((file) => {
        const { data, content } = matter(fs.readFileSync(file, "utf-8"));
        const slug = path.basename(file, ".mdx");
        const url  = type === "note"
            ? `/garden/${data.subject}/${slug}`
            : `${PREFIX[type]}/${slug}`;
        const frontmatter = { ...data, tags: (data.tags ?? []).map((t: string) => t.toLowerCase()) } as F;
        return { type, slug, url, frontmatter, raw: content } as Entry<F>;
    })
    .filter((e) => isDev || !(e.frontmatter as Record<string, unknown>).draft)
    .sort((a, b) => {
        const da = (a.frontmatter as Record<string, unknown>).date as string;
        const db = (b.frontmatter as Record<string, unknown>).date as string;
        return db.localeCompare(da);
    });
}

export const getAllEntries = (): Entry<BaseFrontmatter>[] => (["project", "post", "note", "resource"] as ContentType[]).flatMap((type) => getEntries<BaseFrontmatter>(type));

export const getEntry = <F = Record<string, unknown>>(type: ContentType, slug: string) => 
    getEntries<F>(type).find((e) => e.slug === slug);

