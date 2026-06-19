import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const GARDEN_ROOT = path.join(process.cwd(), "content", "garden");

export type NoteNode = {
    kind:     "note";
    title:    string;
    slug:     string;
    url:      string;
    maturity: "seedling" | "budding" | "evergreen";
    date:     string;
};

export type FolderNode = {
    kind:      "folder";
    name:      string;   // raw fs name, e.g. "ml"
    label:     string;   // display label, e.g. "ML"
    children:  TreeNode[];
    noteCount: number;   // total notes recursively
};

export type TreeNode = NoteNode | FolderNode;

function totalNotes(nodes: TreeNode[]): number {
    return nodes.reduce(
        (acc, n) => acc + (n.kind === "note" ? 1 : n.noteCount),
        0,
    );
}

function readDir(dir: string, inheritedSubject?: string): TreeNode[] {
    if (!fs.existsSync(dir)) return [];

    const isDev = process.env.NODE_ENV === "development";

    return fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => {
            // folders before files, then alphabetical
            if (a.isDirectory() !== b.isDirectory())
                return a.isDirectory() ? -1 : 1;
            return a.name.localeCompare(b.name);
        })
        .flatMap((d): TreeNode[] => {
            const full = path.join(dir, d.name);

            if (d.isDirectory()) {
                const subject = inheritedSubject ?? d.name;
                const children = readDir(full, subject);
                return [{
                    kind:      "folder",
                    name:      d.name,
                    label:     d.name.replace(/-/g, " ").toUpperCase(),
                    children,
                    noteCount: totalNotes(children),
                }];
            }

            if (!d.name.endsWith(".mdx")) return [];

            const { data } = matter(fs.readFileSync(full, "utf-8"));
            if (!isDev && data.draft) return [];

            const slug    = path.basename(d.name, ".mdx");
            const subject = data.subject ?? inheritedSubject ?? "";

            return [{
                kind:     "note",
                title:    data.title ?? slug,
                slug,
                url:      `/garden/${subject}/${slug}`,
                maturity: (data.maturity ?? "seedling") as NoteNode["maturity"],
                date:     data.date ?? "",
            }];
        });
}

export function getGardenTree(): FolderNode[] {
    return readDir(GARDEN_ROOT).filter((n): n is FolderNode => n.kind === "folder");
}
