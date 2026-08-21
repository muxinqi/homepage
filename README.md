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
- A `<meta http-equiv="content-security-policy">` on every page, from
  `security.csp` in the Astro config. Astro hashes its own inline script and
  styles into it, so there is no `'unsafe-inline'` anywhere.

## Design

The visual system is specified in a Claude Design document — ten colour tokens,
three typefaces, a two-track rail grid, and one collapse point at 472px. The
implementation follows it; `src/styles/global.css` is where it lands.

A few things worth knowing before changing anything:

- **Colours are `light-dark()` pairs on `:root`.** Light and dark are two values
  on one line, picked by `color-scheme`. The footer toggle cycles
  System → Light → Dark and only sets a class; a synchronous script in `<head>`
  reads the same key before first paint.
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
