# muxinqi.com

Personal site — projects, notes, and a short Now block. Astro 7, static output,
served from Cloudflare Workers static assets.

> **A push to `main` deploys.** Cloudflare Workers Builds is wired to this
> repository from the dashboard, not from a file in the repo, so nothing here
> would otherwise tell you that.
>
> Work on a branch. There is no draft flag — the branch is the draft, previewed
> locally and by the Cloudflare build for that branch. This repository is public,
> so anything pushed anywhere is readable; a flag would only have hidden it from
> the site, not from github.com.

## Commands

| Command         | What it does                                    |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Dev server at `localhost:4321`                    |
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
  lib/content.ts        collection queries and year grouping
  lib/date.ts           the one date dialect — Jul 2026, 2026, closed Feb 2024
  layouts/BaseLayout.astro
  components/           header, footer, theme toggle, rows, empty state
  pages/                /, /projects, /notes, /about, /404
  styles/global.css     every design token, in one file
```

## What the build emits besides pages

- `sitemap-index.xml` + `sitemap-0.xml` — every built page, absolute and https,
  `/404` excluded. `lastmod` is deliberately absent: a build-date stamp on every
  URL is worse than none, and per-page dates would mean hand-rolling the sitemap.
- `robots.txt` — points at the sitemap.
- `_headers` — parsed by Cloudflare Workers static assets. Security headers and
  immutable caching for the content-hashed files in `/_astro/`.
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
  on one line, picked by `color-scheme`.

  The whole theme feature is one state bit: `data-theme` on `<html>`, set by a
  synchronous script in `<head>` before first paint. CSS derives everything from
  it — the colour scheme, which of the toggle's three icons shows, and whether
  the toggle is visible at all (it only exists once the script has run, which
  covers JavaScript being blocked or broken, not just switched off). Because
  `color-scheme` does the work, "System" needs no JavaScript: the attribute says
  `system` and the OS decides, with scrollbars and form controls following free.

  Anything overriding `color-scheme` has to match `:root[data-theme]`, not bare
  `:root` — a media query adds no specificity, so `@media print { :root … }`
  loses to the attribute the toggle writes. See the note on the print block.

  There is no `dark:` utility variant, because nothing but colour differs
  between the two themes. The moment something non-colour does — a border that
  thickens, an image that swaps — add `@custom-variant dark` back; the two
  approaches sit at different layers and coexist fine.

  Nothing in the source worries about `light-dark()` being Baseline only since
  May 2024. Lightning CSS — already in the pipeline, since Tailwind v4 uses it —
  lowers it during the build, driven by the browser targets in
  `astro.config.mjs`. It reads the `data-theme` rules and the `@media print`
  block too, so older browsers keep the system preference, the manual toggle and
  forced-light printing. Change a colour in one place.
- **Layout is flex for collapse, grid + subgrid for alignment.** The rail wraps
  on its own at 472px of content width — `112 + 20 + 340`, not a written-down
  number. `--breakpoint-sm` is the one breakpoint, and it exists to turn the
  sticky year label on at exactly that moment: 472 content px is about 528
  viewport px once the frame's 5vw padding is counted, so the two agree.
- **Fonts are self-hosted.** Astro's font pipeline pulls the latin subsets of
  Newsreader, IBM Plex Sans and IBM Plex Mono into `dist/_astro/fonts/` with
  preload links. The site is English, so the latin subset is the whole of it.
- **`border-radius: 0` everywhere** except the avatar. No shadows, and nothing
  transitions or animates — the `prefers-reduced-motion` block has no motion of
  its own to switch off, only smooth scrolling. A 1px underline appears on link
  hover; appearing is not motion, and it stays for everyone, because taking the
  affordance away would cost more than the stillness is worth.
