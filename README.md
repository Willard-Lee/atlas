# Atlas

> A personal portfolio and digital garden — projects, notes, and resources, all interlinked like a map.

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=fff)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=fff)

My corner of the web: a portfolio, blog, and an evergreen knowledge base, where every page can
link to every other and shows what links back to it.

## What's inside

- **Projects** — write-ups of what I've built, including my final-year GNN forex trading system.
- **Blog** — articles and tutorials.
- **Garden** — atomic notes organised by subject, each marked seedling / budding / evergreen.
- **Resources** — a personal library of papers, books, and references, with one-click citations.

The four sections share a single link graph, so notes, posts, projects, and sources all
reference each other through backlinks and a visual knowledge map.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · MDX (roll-your-own pipeline) · deployed on Vercel.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Project structure

```
app/         routes (projects, blog, garden, resources, tags, graph)
content/     .mdx source for every page
components/   UI + MDX renderers, backlinks, search
lib/         content loading, link graph, search index, citations
public/       static assets and small self-hosted resources
```

## Writing content

Add an `.mdx` file under the matching `content/` folder with frontmatter, then commit — Vercel
rebuilds on push. Link between pages with `[[slug]]` or `[[slug|label]]`; the target page will
automatically show the backlink.

## License

The source code is licensed under the [MIT License](./LICENSE). All written content (blog
posts, notes, and project descriptions) is © 2026 Willard Lee, all rights reserved.
