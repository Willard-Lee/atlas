---
name: atlas-writing-voice
description: >
  Use when drafting, expanding, or polishing any content in this Atlas digital garden — garden notes (content/garden/**), project write-ups (content/projects/**), or blog posts (content/blog/**), i.e. any content/*.mdx. Encodes the owner's personal writing voice plus a per-content-type playbook. Trigger whenever writing or editing an .mdx entry, or when the user says "write in my style/voice", "polish this", "write up a note/project", or similar. Not for code files.
---

# Atlas writing voice

How the owner of this garden writes. Follow the global voice for everything, then the section for the content type you're working on. When in doubt, read a real exemplar (see References) and match its warmth.

## Global voice (applies to notes, projects, and blogs)

- **No em-dashes, and no dashes used as an aside.** This is the #1 rule and a deliberate change from older entries. Write the way people talk. Use commas, full stops, parentheses, or just a new sentence.
  - ✘ `RAG bolts on a second kind — non-parametric knowledge — fetched fresh at question time.`
  - ✔ `RAG bolts on a second kind of knowledge. It's non-parametric, fetched fresh at question time.`
  - (Real hyphens in compound words are fine: `top-k`, `open-source`, `first-principles`.)
- **Sound natural. Keep the quirk.** Casual, self-aware asides are the signature: *"obviously"*, *"if that makes sense"*, the occasional wink. Use them, sparingly and genuinely.
- **First person, warm, opinionated.** "I", "we", real opinions ("this is the boring-but-right way"). You're a person explaining something you care about, not a spec sheet.
- **Simple words, concrete context.** Prefer the plain word over the fancy one. Ground abstractions in a real example before naming the theory.
- **British spelling**: generalise, optimisation, behaviour, neighbour.
- **Bold key terms** on first use. ALL-CAPS only for UI labels / terminal chrome, never for emphasis in prose. No emoji in prose.
- Short sentences are welcome. A one-line landing beats a long qualified one.

## Mode: Notes  (`content/garden/<subject>/<slug>.mdx`)

Goal: **understand, then explain.** You're teaching a reader from zero. Captivate them with simple words and good context, then build the idea up piece by piece.

- **Shape:** hook or motivation → "what is this / why does it matter" → build the concept one step at a time, each step earning the next. Open with a `## What is X` / `## Overview` style heading.
- **Diagrams are a must.** Wherever a picture explains it faster than a paragraph, add a Mermaid diagram (flowchart, sequence, etc.). Mermaid is wired into the MDX pipeline, so a fenced ` ```mermaid ` block renders as a real diagram.
- **Cross-linking is a must.** Before finishing, scan `content/garden/**` and `content/projects/**` for entries this note relates to, and link them inline with `[[slug]]` or `[[slug|readable label]]`. A note that connects to the rest of the garden is the whole point. Tie back to the relevant project when there is one.
- **Frontmatter:** `title`, `date`, `summary`, `subject` (must match the folder), `maturity` (`seedling` → `budding` → `evergreen`; bump it up as the note matures), `tags`, `draft`.
- **MDX affordances to reach for:** GitHub callouts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`), comparison tables, code fences with editorial `# comments` inside, and math with `$inline$` / `$$block$$`.

## Mode: Projects  (`content/projects/<slug>.mdx`)

Goal: **showcase and document.** Show what you built and let the reasoning shine.

- **Skeleton, in this order:**
  1. **What I built** — the thing, in one honest paragraph.
  2. **Why I use this** — the tools/stack and what each earns its place for.
  3. **What's the rationale** — the decisions and trade-offs behind it.
  4. **Explanation** — how it actually works, walked through.
- Confident, casual register. This is the natural home for *"obviously"* and *"if that makes sense"*.
- Link to relevant notes and other projects with `[[wikilinks]]` (e.g. a project links to the study note behind it).
- **Frontmatter:** `title`, `date`, `summary`, `stack` (string array), `status` (`live` | `wip` | `archived`), plus optional `repo`, `demo`, `cover`, `featured`.

## Mode: Blogs  (`content/blog/<slug>.mdx`)

Goal: **polish, don't rewrite.** The owner writes these. Your job is to make their words better, not to replace them.

- Fix grammar and typos. Tighten narrative flow and pacing. Keep their sentences and their voice; change as little as gets the job done.
- Add quirk where it fits, and lean into narrative bridges — the way lifestyle threads (travel, photography, everyday life) get related back to the work. That associative move is part of the charm.
- **No forced linking.** Blogs don't need `[[wikilinks]]` to notes/projects. The owner embeds their own images.
- If something reads as factually or structurally off, flag it rather than silently rewriting.

## Self-audit before you finish

- [ ] Zero em-dashes, and no dash used as an aside.
- [ ] Reads naturally out loud. Quirk present but not forced.
- [ ] (Notes & projects) Relevant `[[links]]` added after actually scanning related content.
- [ ] (Notes) At least one Mermaid diagram where it aids understanding.
- [ ] Frontmatter is valid for this content type.
- [ ] British spelling, bold key terms, no emoji in prose.

## References

- **Voice exemplars:** `content/garden/ml/transformer-attention.mdx` and `content/blog/building-atlas-sys.mdx`. Match their warmth and structure. Note: they predate the no-em-dash rule, so do **not** copy their dash habit.
- **Frontmatter schema:** `lib/types.ts`.
- **MDX affordances + Mermaid wiring:** `lib/mdx.ts`.
- **Wikilink / backlink resolution:** `lib/graph.ts`.
