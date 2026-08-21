// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Astro hashes the inline scripts and styles it generates, but by definition it
// leaves `is:inline` content alone — so the theme script in <head> would not be
// covered. It happens to run anyway, because a CSP delivered via <meta> governs
// only what is parsed after it, and that script sits above the tag. That is luck
// rather than design, and it would break the moment the policy moved into a
// response header.
//
// So hash it here, from the same file the layout injects. Derived at build time,
// never written by hand: editing the script cannot leave a stale hash behind.
const themeInit = readFileSync(new URL('./src/lib/theme-init.js', import.meta.url), 'utf-8');
/** @type {`sha256-${string}`} */
const themeInitHash = `sha256-${createHash('sha256').update(themeInit).digest('base64')}`;

export default defineConfig({
  site: 'https://muxinqi.com',

  // Affects the dev server only: this site is fully prerendered, and trailing
  // slashes on prerendered pages are the host's business — Cloudflare's
  // `html_handling: auto-trailing-slash` redirects `/projects` to `/projects/`
  // in production whatever is set here.
  //
  // It earns its place as a lint. Every internal link, canonical tag and sitemap
  // entry already ends in a slash; with 'always', a link written without one
  // fails locally instead of silently costing a 301 on every click in
  // production. It changes nothing about the built output.
  trailingSlash: 'always',

  // Astro hashes the scripts and styles it processes into the policy, so the
  // site gets a real CSP rather than one softened with 'unsafe-inline'.
  // The policy is emitted as a <meta> tag in builds only — `astro dev` does not
  // apply it, so CSP problems surface in `npm run build`, never in dev.
  security: {
    csp: {
      scriptDirective: { hashes: [themeInitHash] },
    },
  },

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
