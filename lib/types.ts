export type ContentType = "project" | "post" | "note" | "resource";

export interface BaseFrontmatter {
    title: string;
    date: string;
    updated?: string;
    summary?: string;
    draft?: boolean;
}

export interface PostFrontmatter extends BaseFrontmatter {
    cover?: string;
    comments?: boolean;
}

export interface Entry<F = BaseFrontmatter> {
    type: ContentType;
    slug: string;
    url: string;
    frontmatter: F;
    raw: string;
}