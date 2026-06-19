# Atlas

> A personal knowledge OS — projects, blog posts, garden notes, and resources, all graph-linked and statically generated.

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=fff)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=fff)

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — run before pushing
```

---

## Directory Structure

```
atlas/
├── app/                    # Next.js App Router pages + route handlers
│   ├── blog/               # /blog and /blog/[slug]
│   ├── projects/           # /projects and /projects/[slug]
│   ├── garden/             # /garden and /garden/[subject]/[slug]
│   ├── resources/          # /resources and /resources/[slug]
│   ├── tags/               # /tags/[tag]
│   ├── about/
│   └── admin/              # dev-only CMS (404 in production)
├── components/             # UI components
├── content/                # ← ALL CONTENT LIVES HERE
│   ├── blog/
│   ├── projects/
│   ├── garden/
│   │   └── {subject}/      # notes grouped by subject
│   └── resources/
├── lib/
│   ├── content.ts          # MDX file reader + frontmatter parser
│   ├── graph.ts            # wikilink scanner + backlink graph
│   ├── mdx.ts              # unified MDX pipeline
│   └── types.ts            # shared TypeScript types
├── public/
│   ├── covers/             # cover images for posts/projects
│   ├── images/             # body images (uploaded via admin)
│   └── diagrams/           # .excalidraw files
└── styles/
    └── globals.css         # design tokens + prose styles
```

---

## Admin Panel

A local-only content management UI at `http://localhost:3000/admin`. Returns 404 in production.

### Features

| Feature | Description |
|---------|-------------|
| **Compose** | Split-pane editor — metadata fields on the left, MDX body on the right |
| **Toolbar** | One-click insert for H2, H3, bold, italic, code block, callouts, math, figure, table, wikilinks |
| **Preview** | Toggle `◧ PREVIEW` to open a live render pane (updates 600ms after you stop typing) |
| **Resizable panes** | Drag the dividers to adjust metadata / editor / preview widths |
| **Library** | Browse all content with type filter chips + search — EDIT or DEL any file |
| **Draft autosave** | localStorage autosave every 800ms — survives page refresh |
| **Image upload** | Upload to `public/images/` — markdown snippet auto-copied to clipboard |
| **CRUD** | Create, read, update, delete any MDX file without touching the terminal |

### How to use

1. Run `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Pick a content type (BLOG / PROJ / GARD / RESO)
4. Fill in the required fields and write the body
5. Click **[ CREATE FILE ]** — the file is written to `content/` immediately
6. The page is live on the next hot-reload (dev) or next deploy (production)

---

## Content Types

### Blog Post

**Path:** `content/blog/my-post-slug.mdx` → **URL:** `/blog/my-post-slug`

```yaml
---
title: "Post Title"
date: "2026-06-19"            # YYYY-MM-DD
summary: "One-line teaser"
tags: ["tag1", "tag2"]
cover: "/covers/my-post.jpg"  # optional
draft: false
external_url: "https://..."   # optional — redirects listing link to external URL
---
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | |
| `date` | Yes | ISO `YYYY-MM-DD` |
| `summary` | No | Shown in listing cards |
| `tags` | No | Auto-lowercased, creates `/tags/{tag}` pages |
| `cover` | No | Path relative to `public/` |
| `draft` | No | `true` = dev only |
| `external_url` | No | Redirect the listing card link (e.g. to Medium) |

---

### Project

**Path:** `content/projects/project-slug.mdx` → **URL:** `/projects/project-slug`

```yaml
---
title: "Project Name"
date: "2026-06-19"
stack: ["Next.js", "TypeScript"]   # required
status: "wip"                      # live | wip | archived
featured: true                     # appears on home page hero
demo: "https://..."
repo: "https://github.com/..."
cover: "/covers/project.jpg"
excalidraw: "/diagrams/arch.excalidraw"
draft: false
---
```

| Field | Required | Notes |
|-------|----------|-------|
| `stack` | Yes | Shown as tech chips |
| `status` | Yes | `live` · `wip` · `archived` |
| `featured` | No | `true` = shown on home page |
| `excalidraw` | No | Path to `.excalidraw` file in `public/` |

---

### Garden Note

Notes live in a subject subfolder. The subject name appears in the URL and UI.

**Path:** `content/garden/{subject}/note-slug.mdx` → **URL:** `/garden/{subject}/note-slug`

```yaml
---
title: "Note Title"
date: "2026-06-19"
subject: "ml"          # must match the folder name
maturity: "seedling"   # seedling | budding | evergreen
tags: ["transformers"]
draft: false
---
```

| Maturity | Meaning |
|----------|---------|
| `seedling` | Early idea, rough draft |
| `budding` | Developing, mostly written |
| `evergreen` | Mature, stable, well-maintained |

To add a new subject: create a subfolder under `content/garden/`. Example: `content/garden/finance/`.

---

### Resource

**Path:** `content/resources/resource-slug.mdx` → **URL:** `/resources/resource-slug`

```yaml
---
title: "Attention Is All You Need"
date: "2026-06-19"
type: "paper"                             # paper | book | article | dataset | slides
authors: ["Vaswani, A.", "Shazeer, N."]
year: 2017
url: "https://arxiv.org/abs/1706.03762"
doi: "10.48550/arXiv.1706.03762"
publisher: "NeurIPS"
draft: false
---

Optional personal annotations in the body.
```

---

## MDX Features

All content types support the full MDX feature set.

### Callouts

```markdown
> [!NOTE] Optional title
> Content here.

> [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
```

| Type | Accent |
|------|--------|
| `NOTE` | Cyan |
| `TIP` | Green |
| `IMPORTANT` | Violet |
| `WARNING` | Yellow |
| `CAUTION` | Red |

### Wikilinks

```markdown
[[slug]]                        — link to any content by slug
[[slug|custom display text]]    — same, with custom label
```

The linked page automatically shows a backlink in its sidebar. Works across all content types.

### LaTeX Math

```markdown
Inline: $E = mc^2$

Block:
$$
\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$
```

### Code Blocks

````markdown
```typescript title="lib/example.ts"
const x = 1;
```
````

Syntax highlighting via `rehype-pretty-code` (github-dark-dimmed theme).

### Captioned Images

```html
<figure>
  <img src="/images/photo.jpg" alt="description" />
  <figcaption>Caption shown below the image</figcaption>
</figure>
```

### Tables, task lists, strikethrough

Standard GFM — enabled via `remark-gfm`.

---

## Wikilinks & Backlinks

- Write `[[slug]]` anywhere in any MDX body
- The link graph is built at build time — no runtime cost
- Each page's sidebar shows all pages that link to it
- Unresolved slugs degrade to plain text (no broken links, no build errors)

---

## Draft Mode

```yaml
draft: true    # hidden on the live site, visible at localhost:3000
draft: false   # live everywhere (default)
```

---

## Images

### Cover images
Drop into `public/covers/`. Reference as `/covers/filename.jpg` in frontmatter.  
Recommended: **1200 × 630 px**.

### Body images
Use the admin panel's **UPLOAD** button — saves to `public/images/` and copies the markdown snippet to clipboard. Or drop files manually into `public/images/`.

---

## Excalidraw Diagrams

1. Export your diagram from [excalidraw.com](https://excalidraw.com) as `.excalidraw`
2. Save to `public/diagrams/`
3. Add to project frontmatter: `excalidraw: "/diagrams/my-diagram.excalidraw"`

---

## Deploying

```bash
git add content/blog/my-post.mdx
git commit -m "post: my new post"
git push   # Vercel rebuilds automatically (~30s)
```

To preview the production build locally:

```bash
npm run build && npm run start
```

---

## Tech Stack

| Layer | Package |
|-------|---------|
| Framework | Next.js 16 (App Router, RSC, static generation) |
| Styling | Tailwind v4 (CSS-first, no config file) |
| Animations | Framer Motion |
| MDX | `next-mdx-remote/rsc` |
| GFM | `remark-gfm` |
| Math | `remark-math` + `rehype-katex` |
| Syntax highlighting | `rehype-pretty-code` |
| Callouts | Custom `rehypeCallouts` (in `lib/mdx.ts`) |
| Link graph | Custom build-time scanner (`lib/graph.ts`) |
| Frontmatter | `gray-matter` |
| Fonts | JetBrains Mono + Syne + DM Sans via `next/font` |

---

## Security Notes

- The `/admin` route and all `/api/admin/*` route handlers check `NODE_ENV !== "development"` and return 404 in production
- Vercel's production filesystem is read-only (second defense layer)
- All file write operations validate the resolved path is inside `content/` before writing
- Image uploads are restricted to image MIME types and capped at 10 MB

---

## License

Source code: [MIT License](./LICENSE)  
Written content (posts, notes, project descriptions): © 2026 Willard Lee, all rights reserved.
