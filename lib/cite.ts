import type { ResourceFrontmatter } from "./types";

export const toAPA = (r: ResourceFrontmatter) => {
    const src = r.doi ? ` https://doi.org/${r.doi}` : r.url ? ` ${r.url}` : "";
    return `${r.authors.join(", ")} (${r.year}). ${r.title}.${r.publisher ? `${r.publisher}.` : ""}${src}`;
  };

  export const toBibTeX = (r: ResourceFrontmatter, key: string) => {
    const fields = [
      `title={${r.title}}`,
      `author={${r.authors.join(" and ")}}`,
      `year={${r.year}}`,
      r.doi && `doi={${r.doi}}`,
      r.url && `url={${r.url}}`,
    ]
      .filter(Boolean)
      .join(",\n  ");
    return `@${r.type === "book" ? "book" : "article"}{${key},\n  ${fields}\n}`;
  };
