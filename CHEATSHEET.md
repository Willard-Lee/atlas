# Atlas — Styling Cheatsheet

> Tailwind v4 (no config file — tokens live in `styles/globals.css`)

---

## Fonts

| Role    | Variable            | Tailwind class        |
|---------|---------------------|-----------------------|
| Display | `--font-display`    | `font-display`        |
| Body    | `--font-sans`       | `font-sans`           |
| Mono    | `--font-mono`       | `font-mono`           |

**Usage examples**
```html
<h1 class="font-display text-5xl font-bold">Title</h1>
<p class="font-sans text-base">Body text</p>
<code class="font-mono text-sm">inline code</code>
```

---

## Color Tokens

Use as inline styles (`style={{ color: 'var(--primary)' }}`) or in arbitrary Tailwind values (`text-[var(--primary)]`).

### Primary — Vivid Violet
| Token                    | Hex       | Use for                        |
|--------------------------|-----------|-------------------------------|
| `--primary`              | `#ebb2ff` | Text on dark, borders          |
| `--primary-container`    | `#bc13fe` | Filled badges, highlights      |
| `--on-primary`           | `#520072` | Text on `--primary`            |
| `--on-primary-container` | `#ffffff` | Text on `--primary-container`  |

### Secondary — Cyber Cyan
| Token                      | Hex       | Use for                        |
|----------------------------|-----------|-------------------------------|
| `--secondary`              | `#d3fbff` | Links, accents                 |
| `--secondary-container`    | `#00eefc` | Status "live" dot, highlights  |
| `--on-secondary`           | `#00363a` | Text on `--secondary`          |
| `--on-secondary-container` | `#00686f` | Text on `--secondary-container`|

### Surfaces
| Token                       | Hex       | Use for                     |
|-----------------------------|-----------|-----------------------------|
| `--background`              | `#0e0b14` | Page background             |
| `--surface`                 | `#131313` | Default card/section bg     |
| `--surface-container-low`   | `#1c1b1b` | Subtle raised surface       |
| `--surface-container`       | `#201f1f` | Cards                       |
| `--surface-container-high`  | `#2a2a2a` | Elevated cards, code bg     |
| `--surface-container-highest`| `#353534` | Topmost layer               |

### Text
| Token                  | Hex       | Use for                      |
|------------------------|-----------|------------------------------|
| `--on-background`      | `#e5e2e1` | Main body text               |
| `--on-surface`         | `#e5e2e1` | Text on surfaces             |
| `--on-surface-variant` | `#d4c0d7` | Muted/secondary text         |

### Outlines
| Token               | Hex       | Use for              |
|---------------------|-----------|----------------------|
| `--outline`         | `#9d8ba0` | Visible borders      |
| `--outline-variant` | `#504254` | Subtle dividers      |

### Error
| Token                | Hex       |
|----------------------|-----------|
| `--error`            | `#ffb4ab` |
| `--error-container`  | `#93000a` |

---

## Custom Utility Classes

```css
/* Dot-grid background — used in Hero section */
.dot-grid

/* Staggered entrance animations (fade up) */
.animate-fade-up-1   /* delay: 0ms   */
.animate-fade-up-2   /* delay: 150ms */
.animate-fade-up-3   /* delay: 300ms */
```

**Blinking cursor** — apply with inline style or extend:
```css
animation: blink 1s step-start infinite;
```

---

## Prose Styles (MDX content)

Wrap MDX output in `<article class="prose">`. These are pre-styled in globals.css:

| Element       | Style applied                                      |
|---------------|----------------------------------------------------|
| `h1 h2 h3`    | `font-display`, color `--primary`, margins         |
| `p`           | line-height 1.8, color `--on-surface`              |
| `a`           | color `--secondary`, underline                     |
| `code`        | `font-mono`, bg `--surface-container-high`         |
| `blockquote`  | left border `--primary`, text `--on-surface-variant`|

---

## Design Rules

| Rule             | Value                              |
|------------------|------------------------------------|
| Border radius    | `0px` everywhere (`*` reset)       |
| Max width        | `--container-max: 1280px`          |
| Gutter           | `--gutter: 1rem`                   |
| Horizontal margin| `--margin-x: 2rem`                 |
| Grid unit        | `--grid-unit: 4px`                 |

---

## Common Patterns

### Badge / chip
```html
<span class="font-mono text-xs px-2 py-1 border"
  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
  LIVE
</span>
```

### Card
```html
<div class="border p-4"
  style={{ background: 'var(--surface-container)', borderColor: 'var(--outline-variant)' }}>
```

### Muted label
```html
<span class="text-xs font-mono" style={{ color: 'var(--on-surface-variant)' }}>
  2026-06-16
</span>
```

### Status dots
```html
/* live  */ <span style={{ background: 'var(--secondary-container)' }} class="w-2 h-2 inline-block" />
/* wip   */ <span style={{ background: 'var(--primary-container)' }}   class="w-2 h-2 inline-block" />
/* draft */ <span style={{ background: 'var(--tertiary-container)' }}  class="w-2 h-2 inline-block" />
```
