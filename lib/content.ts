import "server-only";
import fs from "node:fs"; /* fs module provides APIs for file system operations */
import path from "node:path";  /* path module provides utilities for working with file and directory paths */
import matter from "gray-matter"; /* gray-matter is a library for parsing YAML frontmatter from markdown files */
import type {ContentType, Entry} from "./types"; /* ContentType and Entry types from ./types */

const ROOT = path.join(process.cwd(), "content");
const DIR: Record<ContentType, string> = { /*this creates an object mapping ContentType to directory name*/
    project: "projects",
    post: "blog",
    note: "garden",
    resource: "resources",
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

export function getEntries<F = Record<string, unknown>> (type: ContentType): Entry<F>[] {
    const base = path.join(ROOT, DIR[type]);
    return walk(base).map((file) => {
        const { data, content} = matter(fs.readFileSync(file, "utf-8"));
        const slug = path.basename(file, ".mdx");
        const url = `${PREFIX[type]}/${slug}`;
        const fm = {...data, tags: (data.tags ?? []).map((t: string) => t.toLowerCase())} as F;
        return {
            type, slug, url, frontmatter: fm, raw: content } as Entry<F>;
    }).filter((e) => process.env.NODE_ENV === "development" || !(e.frontmatter as Record<string, unknown>).draft).sort((a, b) => ((b.frontmatter as Record<string, unknown>).date as string).localeCompare((a.frontmatter as Record<string, unknown>).date as string));
}

export const getEntry = <F = Record<string, unknown>>(type: ContentType, slug: string) => 
    getEntries<F>(type).find((e) => e.slug === slug);
