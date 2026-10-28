// @ts-check
import { readdirSync, renameSync, rmdirSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// `hasNotes()` in src/lib/content.ts answers this from the content collection,
// which is the right source everywhere else. Integrations are configured before
// the collection exists, so this reads the directory instead — the same fact,
// asked earlier. Both are one line; keep them in step.
const hasNotes = readdirSync('./src/content/notes', { recursive: true }).some((f) =>
  String(f).endsWith('.md'),
);

// Mirrors src/i18n/locales.ts, which this file cannot import.
const locales = ['en', 'zh'];

/**
 * Cloudflare answers a missing path with the 404.html nearest to it, so
 * /zh/anything gets /zh/404.html — but Astro writes a `[lang]/404` page as
 * /zh/404/index.html, which Cloudflare never looks for. This moves each one to
 * where it is looked for. The root 404.html is Astro's own and needs nothing.
 *
 * @type {import('astro').AstroIntegration}
 */
const localized404 = {
  name: 'localized-404',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const lang of locales) {
        renameSync(new URL(`${lang}/404/index.html`, dir), new URL(`${lang}/404.html`, dir));
        rmdirSync(new URL(`${lang}/404/`, dir));
      }
    },
  },
};

export default defineConfig({
  site: 'https://muxinqi.com',

  // English at /en/, Chinese at /zh/, and nothing at /: Cloudflare redirects it
  // to /en/ (public/_redirects). Astro's own redirect for `/` would be a page
  // that waits two seconds and then navigates, so it is switched off.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', { path: 'zh', codes: ['zh-Hans'] }],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },

  integrations: [
    sitemap({
      // `/notes` sets `noindex` while it is empty, and submitting a page in a
      // sitemap while telling robots to skip it is a contradiction Search
      // Console reports back as a warning. The 404s are never pages of their
      // own.
      filter: (page) => (hasNotes || !page.endsWith('/notes/')) && !page.endsWith('/404/'),
      // Pairs each URL with its other-language twin, the same pairs the
      // hreflang links in <head> declare.
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hans' } },
    }),
    localized404,
  ],

  // Self-hosted from Google's catalogue: latin subset only, emitted into dist as
  // woff2 with preload and metric-matched fallbacks. Chinese is not downloaded at
  // all — a CJK webfont is megabytes — so each stack names the system's own
  // Chinese faces after its Latin one. A Chinese glyph falls through Newsreader
  // or Plex to Songti or PingFang; Latin text never reaches them.
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: [400, 500],
      // Upright only. Newsreader is --font-display, which is worn by the h1s,
      // the project titles and the wordmark — all plain strings. Markdown runs
      // in .prose, which inherits the body face, so no <em> can ever land in
      // this family and the italic files would ship unreachable.
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Songti SC', 'Noto Serif CJK SC', 'Source Han Serif SC', 'serif'],
    },
    {
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Microsoft YaHei', 'sans-serif'],
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', 'monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        // Packed as major << 16 | minor << 8. Tailwind v4's own floor is
        // Chrome 111, but this layout is held together by `subgrid`, which
        // Chrome only shipped in 117 and Lightning CSS cannot lower. Below that
        // every row stacks its rail above its content instead of beside it, so
        // 117 is the real floor and saying 111 was flattering ourselves.
        targets: {
          chrome: 117 << 16,
          safari: (16 << 16) | (4 << 8),
          firefox: 128 << 16,
        },
      },
    },
  },
});
