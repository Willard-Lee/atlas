export type ContentType = "project" | "post" | "note" | "resource";

export interface BaseFrontmatter {
    title: string;
    date: string;
    updated?: string;
    tags?: string[];
    summary?: string;
    draft?: boolean;
}

export interface PostFrontmatter extends BaseFrontmatter {
    cover?: string;
    comments?: boolean;
}

export interface ProjectFrontmatter extends BaseFrontmatter {
    stack : string[];
    status: "live" | "wip" | "archived";
    demo? : string;
    repo? : string;
    cover? : string;
    featured? : boolean;
    
}

export interface NoteFrontmatter extends BaseFrontmatter {
    subject: string;
    maturity: "seedling" | "budding"| "evergreen";
}

export interface ResourceFrontmatter extends BaseFrontmatter {
    type: "paper" | "book" | "article" | "dataset" | "slides";
    authors: string[];
    year: number;
    url?: string;
    file?: string;
    doi?: string;
    publisher?: string;
    private?: boolean;

}
export interface Entry<F = BaseFrontmatter> {
    type: ContentType;
    slug: string;
    url: string;
    frontmatter: F;
    raw: string;
}