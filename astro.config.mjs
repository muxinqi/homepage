// @ts-check
import { readdirSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// `hasNotes()` in src/lib/content.ts answers this from the content collection,
// which is the right source everywhere else. Integrations are configured before
// the collection exists, so this reads the directory instead — the same fact,
// asked earlier. Both are one line; keep them in step.
const hasNotes = readdirSync('./src/content/notes').some((f) => f.endsWith('.md'));

export default defineConfig({
  site: 'https://muxinqi.com',
  // `/notes` sets `noindex` while it is empty, and submitting a page in a
  // sitemap while telling robots to skip it is a contradiction Search Console
  // reports back as a warning.
  integrations: [sitemap({ filter: (page) => hasNotes || !page.endsWith('/notes/') })],

  // Self-hosted from Google's catalogue: latin subset only, emitted into dist as
  // woff2 with preload and metric-matched fallbacks. The site is English, so the
  // latin subset is the whole of it.
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
      fallbacks: ['Georgia', 'serif'],
    },
    {
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
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
