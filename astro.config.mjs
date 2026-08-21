// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://muxinqi.com',

  // Every internal link and every built path already ends in a slash. Saying so
  // explicitly keeps dev identical to production and stops a stray link without
  // one from becoming a second URL for the same page.
  trailingSlash: 'always',

  // Astro hashes its own inline scripts and styles into the policy, so the site
  // gets a real CSP rather than one softened with 'unsafe-inline'.
  security: { csp: true },

  integrations: [sitemap()],

  // Self-hosted from Google's catalogue: latin subset only, emitted into dist as
  // woff2 with preload and metric-matched fallbacks. CJK is never downloaded —
  // it falls through to the system faces listed in each `fallbacks`.
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Songti SC', 'Georgia', 'serif'],
    },
    {
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['PingFang SC', 'ui-monospace', 'monospace'],
    },
  ],

  vite: { plugins: [tailwindcss()] },
});
