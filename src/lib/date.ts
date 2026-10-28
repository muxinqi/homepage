import type { Locale } from "@i18n/locales";

/**
 * One date dialect per language. Only human writings appear on screen — `2026`,
 * `Jul 2026`, `closed Feb 2024`, or `2026 年 7 月` — and the machine-readable
 * form goes in `<time datetime>`.
 *
 * Everything here is absolute rather than relative ("2 mo ago"): the site is a
 * static build, so a relative label freezes at build time and quietly becomes
 * false. An absolute month never does.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** `2026` */
export function year(date: Date): string {
  return String(date.getUTCFullYear());
}

/** `Jul` / `7 月` — used in the month track of a year-grouped list. */
export function month(date: Date, lang: Locale): string {
  return lang === "zh" ? `${date.getUTCMonth() + 1} 月` : MONTHS[date.getUTCMonth()];
}

/** `Jul 2026` / `2026 年 7 月` */
export function monthYear(date: Date, lang: Locale): string {
  return lang === "zh"
    ? `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月`
    : `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `closed Feb 2024` / `2024 年 2 月停用` — an offline project's own headline. */
export function closedOn(date: Date, lang: Locale): string {
  return lang === "zh" ? `${monthYear(date, lang)}停用` : `closed ${monthYear(date, lang)}`;
}

/** `2026-07-18` — the `datetime` attribute of a `<time>` element. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
