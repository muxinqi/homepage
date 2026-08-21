/**
 * One date dialect. Only human writings appear on screen — `2026`, `Jul 2026`,
 * `closed Feb 2024`. The machine-readable form goes in `<time datetime>`.
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

/** `Jul` — used in the month track of a year-grouped list. */
export function month(date: Date): string {
  return MONTHS[date.getUTCMonth()];
}

/** `Jul 2026` */
export function monthYear(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2026-07-18` — the `datetime` attribute of a `<time>` element. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Full RFC 3339 timestamp, which is what Atom's `updated` field wants. */
export function isoStamp(date: Date): string {
  return date.toISOString();
}
