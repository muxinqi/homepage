// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://muxinqi.com',
  integrations: [sitemap()],

  // Self-hosted from Google's catalogue: latin subset only, emitted into dist as
  // woff2 with preload and metric-matched fallbacks. The site is English, so the
  // latin subset is the whole of it.
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal', 'italic'],
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
        // Packed as major << 16 | minor << 8. These match Tailwind v4's own
        // floor — below it the utilities do not work anyway, so supporting
        // anything older would be pretending.
        targets: {
          chrome: 111 << 16,
          safari: (16 << 16) | (4 << 8),
          firefox: 128 << 16,
        },
      },
    },
    build: { cssMinify: 'lightningcss' },
  },
});
