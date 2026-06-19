# Atlas

> A personal portfolio and digital garden — projects, notes, blog, and resources, all interlinked.

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=fff)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=fff)

---

## Do I need a backend?

**No.** Atlas is file-based and statically generated.

- Content lives as `.mdx` files in the `content/` folder
- To add or edit content: open the file, make changes, save, push to git
- Vercel picks up the push and rebuilds the site in ~30 seconds
- Every page is pre-rendered at build time — no server, no database, no auth

A backend (database + admin UI + API routes) would make sense if you had a team editing content, needed a rich CMS UI, or were managing hundreds of posts. For a personal site, file editing is faster and simpler.

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000  — hot reload as you edit MDX files
npm run build    # production build — run this to catch errors before pushing
```

---

## Directory Structure

```
atlas/
├── app/                    # Next.js App Router pages
│   ├── blog/               # /blog and /blog/[slug]
│   ├── projects/           # /projects and /projects/[slug]
│   ├── garden/             # /garden and /garden/[subject]/[slug]
│   ├── resources/          # /resources and /resources/[slug]
│   ├── tags/               # /tags/[tag]
│   └── about/              # /about
├── components/             # UI components
├── content/                # ← YOUR CONTENT LIVES HERE
│   ├── blog/               # blog posts
│   ├── projects/           # project write-ups
│   ├── garden/
│   │   └── {subject}/      # notes grouped by subject
│   └── resources/          # papers, books, articles
├── lib/                    # content loading, link graph, search
├── public/
│   ├── covers/             # ← cover images for posts and projects
│   └── diagrams/           # ← .excalidraw diagram files
└── styles/
    └── globals.css         # design tokens and global styles
```

---

## Content Management

All content is managed by creating, editing, or deleting `.mdx` files. The filename becomes the URL slug.

> **Slug rules:** use lowercase and hyphens only. `my-post.mdx` → `/blog/my-post`. No spaces, no special characters.

### Create

Make a new `.mdx` file in the correct folder with the required frontmatter. The file appears automatically on the next build (or immediately in dev mode).

### Edit

Open the file and change the frontmatter or body content. Save → the page updates.

### Delete

Delete the file. It disappears from all listing pages, search, and tag pages automatically.

---

## Blog Post

**Path:** `content/blog/my-post-slug.mdx`  
**URL:** `/blog/my-post-slug`

```yaml
---
title: "Post Title"
date: "2026-06-18"            # YYYY-MM-DD, required
summary: "One-line teaser shown in listings"
tags: ["tag1", "tag2"]        # optional — links to /tags/tag1
cover: "/covers/my-post.jpg"  # optional — image in public/covers/
draft: false                  # true = dev only, false = live
---

Your post content here. Standard Markdown plus MDX components.
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Displayed as heading |
| `date` | Yes | ISO format `YYYY-MM-DD` |
| `summary` | No | Shown in listing cards |
| `tags` | No | Array of strings, auto-lowercased |
| `cover` | No | Path relative to `public/` |
| `draft` | No | Defaults to `false` |
| `external_url` | No | If set, listing card links here instead |

---

## Project

**Path:** `content/projects/project-slug.mdx`  
**URL:** `/projects/project-slug`

```yaml
---
title: "Project Name"
date: "2026-06-18"
summary: "Short description shown in listing cards"
stack: ["Next.js", "Python", "PostgreSQL"]   # required, shown as chips
status: "live"                               # live | wip | archived
demo: "https://your-demo.com"               # optional
repo: "https://github.com/you/repo"         # optional
cover: "/covers/project.jpg"                # optional
featured: true                              # shows on home page
tags: ["ml", "web"]
draft: false
excalidraw: "diagram.excalidraw"            # optional, see Excalidraw section
---

Project write-up here. Describe what you built, why, and how.
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | |
| `date` | Yes | |
| `stack` | Yes | Array — shown as tech chips |
| `status` | Yes | `live` (green) · `wip` (violet) · `archived` (grey) |
| `summary` | No | |
| `demo` | No | Live demo link |
| `repo` | No | Source code link |
| `cover` | No | |
| `featured` | No | `true` shows on home page |
| `excalidraw` | No | Filename in `public/diagrams/` |
| `draft` | No | |

---

## Garden Note

Notes live in a subject subfolder. The subject folder name is used in the URL and shown in the UI.

**Path:** `content/garden/{subject}/note-slug.mdx`  
**URL:** `/garden/{subject}/note-slug`

```yaml
---
title: "Note Title"
date: "2026-06-18"
subject: "engineering"        # must match the folder name
maturity: "seedling"          # seedling | budding | evergreen
tags: ["transformer", "nlp"]
draft: false
---

Note body here. Use wikilinks to connect to other notes.
See [[attention-is-all-you-need]] for the source.
```

**To add a new subject:** create a new subfolder under `content/garden/`. Example: `content/garden/finance/`.

| Maturity | Meaning |
|----------|---------|
| `seedling` | Early idea, rough draft |
| `budding` | Developing thought, mostly written |
| `evergreen` | Mature, stable, well-maintained |

---

## Resource

**Path:** `content/resources/resource-slug.mdx`  
**URL:** `/resources/resource-slug`

```yaml
---
title: "Attention is All You Need"
date: "2026-06-18"
type: "paper"                             # paper | book | article | dataset | slides
authors: ["Vaswani, A.", "Shazeer, N."]  # required array
year: 2017                               # required number
url: "https://arxiv.org/abs/1706.03762"  # optional, links in listing
doi: "10.48550/arXiv.1706.03762"         # optional
publisher: "NeurIPS"                     # optional
tags: ["transformer", "deep-learning"]
draft: false
---

Optional personal notes below the frontmatter.
These appear as "MY NOTES" on the resource detail page.
```

Set `private: true` to hide a resource from all listings (useful for personal reference).

---

## Cover Images

1. Drop your image into `public/covers/` — any format works (`.jpg`, `.png`, `.webp`)
2. Add the `cover` field to the frontmatter:
   ```yaml
   cover: "/covers/my-image.jpg"
   ```
3. The image replaces the generated tile in the listing card and appears at the top of the detail page

Recommended dimensions: **1200 × 630px** for a good aspect ratio on listing cards.

---

## Excalidraw Diagrams (Projects)

1. Export your diagram from [Excalidraw](https://excalidraw.com) as `.excalidraw` (JSON format)
2. Save it in `public/diagrams/`
3. Add to the project frontmatter:
   ```yaml
   excalidraw: "my-diagram.excalidraw"
   ```
4. The diagram renders as an interactive, view-only embed at the bottom of the project page

---

## Obsidian Callouts

Use these in any MDX content body:

```
> [!NOTE] Optional custom title
> Note content here.

> [!TIP]
> A helpful tip.

> [!WARNING] Watch out
> Something to be careful about.

> [!IMPORTANT]
> Critical information.

> [!CAUTION]
> Dangerous or irreversible action.
```

Callout types and their colours:
| Callout | Colour |
|---------|--------|
| `NOTE` | Cyan |
| `TIP` | Green |
| `WARNING` | Yellow |
| `IMPORTANT` | Violet |
| `CAUTION` | Orange |

---

## Backlinks and Wikilinks

Link between any two pages using wikilink syntax in any MDX body:

```
See [[note-slug]] for background.
See [[note-slug|custom display text]] for background.
```

- The target page automatically shows a backlink in its sidebar
- Works across all content types (post → project, note → resource, etc.)
- The slug is the filename without `.mdx`

---

## Tags

Tags are defined in frontmatter and auto-create a tag page at `/tags/{tag}`.

```yaml
tags: ["machine-learning", "rag", "python"]
```

- Use lowercase and hyphens
- All content types support tags
- Tag pages group entries across all content types

---

## Draft Mode

```yaml
draft: true    # hidden on the live site, visible at localhost:3000
draft: false   # live everywhere (default if omitted)
```

Use drafts to work on content without publishing. Switch to `false` when ready, then push.

---

## Deploying

The site deploys automatically on Vercel when you push to `main`.

```bash
# Add new content
git add content/blog/my-new-post.mdx public/covers/my-cover.jpg
git commit -m "post: publish my new post"
git push

# Vercel picks up the push and rebuilds in ~30s
```

To preview before pushing:

```bash
npm run build   # full production build — surfaces any errors
npm run start   # serve the production build locally
```

---

## Design Reference

See `CHEATSHEET.md` for the full design token reference — colours, fonts, spacing, custom utility classes, and UI patterns used throughout the site.

---

## License

Source code: [MIT License](./LICENSE)  
Written content (posts, notes, project descriptions): © 2026 Willard Lee, all rights reserved.
