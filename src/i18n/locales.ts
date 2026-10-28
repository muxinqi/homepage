/**
 * The two languages, and everything that varies with them but is not wording.
 *
 * Every page exists in both. There is no fallback and no "translation missing"
 * state: a page, project, or note without its other half fails the build (see
 * `pairs` in src/lib/content.ts), so nothing downstream ever has to ask whether
 * the other language exists.
 *
 * Keep `locales` in step with `i18n.locales` in astro.config.mjs, which cannot
 * import this file.
 */
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

/**
 * BCP 47 tags for `<html lang>` and `hreflang`. Chinese names its script, not a
 * region: the text is Simplified Chinese wherever the reader lives. English has
 * one script, so the bare language is the whole of it.
 */
export const htmlLang = { en: "en", zh: "zh-Hans" } as const satisfies Record<Locale, string>;

/** Each language's own name for itself — what the switch shows. */
export const localeName = { en: "English", zh: "中文" } as const satisfies Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(lang: Locale): Locale {
  return lang === "en" ? "zh" : "en";
}

/** `getStaticPaths` for a page that has nothing else to vary on. */
export function localeParams() {
  return locales.map((lang) => ({ params: { lang } }));
}

/** `localePath("zh", "/projects/")` → `/zh/projects/`. */
export function localePath(lang: Locale, path = "/"): string {
  return `/${lang}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The locale a URL path belongs to, and the rest of it. The path is what the
 * language switch and `hreflang` keep while swapping the prefix.
 */
export function splitPath(pathname: string): { lang: Locale; rest: string } {
  const [, first = "", ...more] = pathname.split("/");
  if (!isLocale(first)) throw new Error(`No locale prefix on ${pathname}`);
  return { lang: first, rest: `/${more.join("/")}` };
}
