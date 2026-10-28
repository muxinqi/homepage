# muxinqi.com

Personal site — projects, notes, and a short Now block, in English at `/en/`
and Chinese at `/zh/`. Astro 7, static output, served from Cloudflare Workers
static assets.

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
| `npm run dev`   | Dev server — open `localhost:4321/en/` (`/` only redirects on Cloudflare) |
| `npm run build` | Static build into `dist/`                        |
| `npm run check` | `astro check`, then checks dish photos are ready to publish |
| `npm run photos` | Shrinks dish photos to 2400px and strips their metadata, in place |
| `npm run preview` | Build, then serve through `wrangler dev`       |
| `npm run deploy`  | Build and `wrangler deploy` — publishes         |

## Content

All of it lives in `src/content/`, as Markdown, once per language. See
[`src/content/README.md`](src/content/README.md) for how to add a note or a
project, what the three project statuses mean, and what is still missing.

## Structure

```
src/
  content.config.ts     collection schemas (projects, notes, now)
  content/              the Markdown itself, under en/ and zh/; dishes/ holds
                        one YAML file and one photo per dish
  i18n/locales.ts       the two languages, their tags, and URL helpers
  i18n/ui.ts            every word the chrome uses, in both languages
  lib/content.ts        collection queries, year grouping, the pairing check
  lib/date.ts           one date dialect per language — Jul 2026 / 2026 年 7 月
  layouts/BaseLayout.astro
  components/           header, footer, theme toggle, rows, empty state, 404
  pages/[lang]/         /, /projects, /notes, /about, /404 — each built for en and zh
  pages/404.astro       for paths under neither language
  styles/global.css     every design token, in one file
```

## What the build emits besides pages

- `sitemap-index.xml` + `sitemap-0.xml` — every built page, absolute and https,
  the 404s excluded, each URL paired with its other-language twin. `lastmod` is
  deliberately absent: a build-date stamp on every URL is worse than none, and
  per-page dates would mean hand-rolling the sitemap.
- `_redirects` — parsed by Cloudflare Workers static assets. `/` answers with a
  302 to `/en/`, and the addresses from before the site had languages answer
  with a 301 to their `/en/` equivalents.
- `404.html`, `en/404.html`, `zh/404.html` — Cloudflare serves the one nearest
  the missing path. Astro writes the two language ones as `404/index.html`; a
  small build step in `astro.config.mjs` moves them to where they are looked for.
- `robots.txt` — points at the sitemap.
- `_headers` — parsed by Cloudflare Workers static assets. Security headers,
  immutable caching for the content-hashed files in `/_astro/`, and
  `X-Robots-Tag: noindex` on every `workers.dev` host. That last one exists
  because `preview_urls` is on in `wrangler.jsonc`: each pull request gets a
  public preview link on `workers.dev`, and it must not compete with the custom
  domain in search. `workers_dev` stays off, so production has no
  `workers.dev` copy at all.
- `og.png`, `og-zh.png` — the 1200×630 social cards in `public/`, one per
  language. Each is a screenshot of `scripts/og-card.html`, which is built from
  the site's own tokens and webfonts; the command is at the top of that file.
  Re-render both if the name, the one-liner, or the light-theme colours change.
  They are static, so nothing in the build touches them.

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
- **Fonts are self-hosted, for Latin only.** Astro's font pipeline pulls the
  latin subsets of Newsreader, IBM Plex Sans and IBM Plex Mono into
  `dist/_astro/fonts/` with preload links. Chinese is not downloaded: a CJK
  webfont runs to megabytes, so each stack names the system's own Chinese faces
  (Songti, PingFang, Noto CJK) after its Latin one, in the `fallbacks` in
  `astro.config.mjs`.
- **Every page exists in both languages, and shows only one.** English lives at
  `/en/`, Chinese at `/zh/`, and the header's switch goes to the same page in the
  other language. Nothing on a page mixes the two — not even the switch, which
  names only the language it leads to. Because every page has a twin, nothing
  ever has to ask whether a translation exists: no fallbacks, no "not available
  in Chinese" state, a switch that always has somewhere to go, and `hreflang`
  pairs that are always complete. The cost is that nothing is published until
  both halves are written, and the build enforces that — `pairs` in
  `src/lib/content.ts` fails on an entry missing its other half, or on two halves
  that disagree about anything but wording.
- **Both languages carry a prefix, and `/` redirects.** `/en/` and `/zh/` are
  symmetric, so every page is one route file under `src/pages/[lang]/` with no
  special case for a default. `/` itself is a 302 to `/en/`, answered by
  Cloudflare from `public/_redirects` before any page is involved. It does not
  guess from the browser's language and does not remember a choice: the bare
  domain is the link on a resume, and it should open the same page for everyone.
  Astro's built-in redirect for `/` is off on purpose — in a static build it is a
  page that waits two seconds and then navigates.
- **The menu's dishes and photos live in this repository.** One YAML file per
  dish with its photo beside it, read through a content collection whose schema
  checks the category, the heat, both languages, and that the photo exists — a
  mistake fails `npm run check` on the branch instead of shipping. Photos are
  rendered by Astro's own pipeline as AVIF and WebP at the sizes actually shown,
  and the tap-to-enlarge view is a native `<dialog>` with no animation. Before a
  photo is committed, `npm run photos` brings it under 2400px and strips its
  metadata, because the repository is public and a phone photo can carry the
  place it was taken; `npm run check` refuses one that has not been through it.
- **`border-radius: 0` everywhere** except the avatar. No shadows, and nothing
  transitions or animates — the `prefers-reduced-motion` block has no motion of
  its own to switch off, only smooth scrolling. A 1px underline appears on link
  hover; appearing is not motion, and it stays for everyone, because taking the
  affordance away would cost more than the stillness is worth.
