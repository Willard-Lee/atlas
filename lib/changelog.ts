// ── Atlas changelog — single source of truth ────────────────────────────────
// Rendered at /changelog and linked from the footer. This file doubles as the
// running record of what has shipped: read it to see prior work, and when new
// features land, prepend/extend the top entry and bump the version here + in
// components/Hero.tsx + package.json together (keep all three in sync).
// Newest entry first. Style: Keep a Changelog.

export interface ChangelogEntry {
    version: string;   // semver, e.g. "1.1.0"
    date: string;      // YYYY-MM-DD
    title?: string;    // optional one-line headline
    changes: {
        added?: string[];
        changed?: string[];
        fixed?: string[];
        security?: string[];
    };
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "1.1.0",
        date: "2026-07-02",
        title: "Authoring, embeds & reading experience",
        changes: {
            added: [
                "Admin Editors tab: resume drafts, view uncommitted content, and one-click commit + push to GitHub.",
                "MDX embeds — Instagram, X/Twitter, reference LinkCards, and a generic responsive iframe.",
                "Composer quality-of-life: frontmatter lint, slug-collision check, and live reading-time.",
                "Nine new resource papers (BERT, seq2seq, GARCH, RL & computational-finance surveys, and more).",
                "New blog category: sports → FIELD_OPS.",
            ],
            changed: [
                "Dark mode is now the default theme.",
                "Article headings follow the reader's chosen font; serif reads heavier in light mode.",
                "Garden tree sidebar is hidden on mobile (the bottom-sheet popup is the mobile nav).",
            ],
            fixed: [
                "Garden note subject \"AI/ML\" produced an encoded /garden/AI%2FML/… URL — normalized to \"ai-ml\".",
            ],
            security: [
                "Hardened admin path-traversal guards, tightened the Instagram postMessage origin check, and added an http(s) allowlist for embed URLs.",
            ],
        },
    },
    {
        version: "1.0.0",
        date: "2026-06-15",
        title: "Atlas launch",
        changes: {
            added: [
                "Initial Atlas: MDX content pipeline with [[wikilink]] graph linking and automatic backlinks.",
                "Blog, projects, digital garden, and resources sections.",
                "Retro-terminal design system, LaTeX math, and a dev-only admin panel.",
            ],
        },
    },
];
