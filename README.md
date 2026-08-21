# muxinqi.com

Personal site — projects, notes, and a short Now block. Astro 7, static output,
served from Cloudflare Workers static assets.

> **A push to `main` deploys.** Cloudflare Workers Builds is wired to this
> repository from the dashboard, not from a file in the repo, so nothing here
> would otherwise tell you that. Work on a branch.

## Commands

| Command         | What it does                                    |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Dev server at `localhost:4321`, drafts visible   |
| `npm run build` | Static build into `dist/`                        |
| `npm run check` | `astro check` — types and template diagnostics   |
| `npm run preview` | Build, then serve through `wrangler dev`       |
| `npm run deploy`  | Build and `wrangler deploy` — publishes         |

## Content

All of it lives in `src/content/`, as Markdown. See
[`src/content/README.md`](src/content/README.md) for how to add a note or a
project, what the three project statuses mean, and what is still missing.

## Structure

```
src/
  content.config.ts     collection schemas (projects, notes, now)
  content/              the Markdown itself
  lib/content.ts        collection queries, draft filtering, year grouping
  lib/date.ts           the one date dialect — Jul 2026, 2026, closed Feb 2024
  layouts/BaseLayout.astro
  components/           header, footer, theme toggle, rows, empty state
  pages/                /, /projects, /notes, /about, /404, /notes/feed.xml
  styles/global.css     every design token, in one file
```

## What the build emits besides pages

- `sitemap-index.xml` + `sitemap-0.xml` — six URLs, absolute and https, `/404`
  excluded. `lastmod` is deliberately absent: a build-date stamp on every URL is
  worse than none, and per-page dates would mean hand-rolling the sitemap.
- `robots.txt` — points at the sitemap.
- `_headers` — parsed by Cloudflare Workers static assets. Security headers plus
  immutable caching for the content-hashed files in `/_astro/`. It only applies
  to static asset responses, which is all this site serves.
- `og.png` — the 1200×630 social card in `public/`. It was rendered by loading a
  card built from the site's own tokens and webfonts in headless Chrome at
  exactly that size. Regenerate the same way if the name or the one-liner
  changes; it is static, so nothing needs to build it.

There is deliberately no Content Security Policy. CSP mitigates injected script,
and this site has no injection surface: no user content, no query parameters read
at runtime, no third-party scripts, no forms. It is HTML compiled from Markdown
in this repo. The cost was real — a hash to keep in sync for every inline script
— so it was removed rather than carried.

## Design

The visual system is specified in a Claude Design document — ten colour tokens,
three typefaces, a two-track rail grid, and one collapse point at 472px. The
implementation follows it; `src/styles/global.css` is where it lands.

A few things worth knowing before changing anything:

- **Colours are `light-dark()` pairs on `:root`.** Light and dark are two values
  on one line, picked by `color-scheme`. The footer toggle cycles
  System → Light → Dark and only sets a class; a synchronous script in `<head>`
  reads the same key before first paint. Because `color-scheme` does the work,
  "System" needs no JavaScript at all — removing the class is the whole
  mechanism, and scrollbars and form controls follow along for free.

  There is no `dark:` utility variant, because nothing but colour differs
  between the two themes. The moment something non-colour does — a border that
  thickens, an image that swaps — add `@custom-variant dark` back; the two
  approaches sit at different layers and coexist fine.

  Nothing in the source worries about `light-dark()` being Baseline only since
  May 2024. Lightning CSS — already in the pipeline, since Tailwind v4 uses it —
  lowers it during the build, driven by the browser targets in
  `astro.config.mjs`. It reads the `:root.light` / `:root.dark` rules and the
  `@media print` block too, so older browsers keep the system preference, the
  manual toggle, and the forced-light printing. Change a colour in one place.
- **Layout is flex for collapse, grid + subgrid for alignment.** The two
  breakpoints (`sm`, `md`) handle sticky year labels, a type floor, and nav
  shape — they do not define layout tracks. The rail wraps on its own at 472px,
  which is `112 + 20 + 340` rather than a written-down number.
- **Fonts are self-hosted.** Astro's font pipeline pulls the latin subsets of
  Newsreader, IBM Plex Sans and IBM Plex Mono into `dist/_astro/fonts/` with
  preload links. Chinese never downloads a webfont — it falls through to
  PingFang SC and friends.
- **`border-radius: 0` everywhere** except the avatar. No shadows. The only
  motion is a 1px underline on link hover, which `prefers-reduced-motion`
  removes.
