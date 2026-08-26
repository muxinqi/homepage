import { getCollection, type CollectionEntry } from "astro:content";

/**
 * There is no draft flag. The branch is the draft: this repository is public, so
 * a `draft: true` file was already readable as Markdown on github.com the moment
 * it was pushed — the flag hid it from one of two doors. Unfinished work stays on
 * a branch, where `npm run dev` and the Cloudflare preview build can both reach
 * it, and merging to `main` is what publishes.
 */

export type Project = CollectionEntry<"projects">;
export type Note = CollectionEntry<"notes">;

/** Newest first — the rail carries recency, so the order has to agree with it. */
function byNewest(a: { data: { created: Date } }, b: { data: { created: Date } }) {
  return b.data.created.valueOf() - a.data.created.valueOf();
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection("projects")).sort(byNewest);
}

export async function getNotes(): Promise<Note[]> {
  return (await getCollection("notes")).sort(byNewest);
}

/**
 * Whether the Notes section exists yet, which is what puts it in the nav.
 *
 * An empty room should not be advertised: until the first note is published
 * there is no Notes item, no Notes block on the homepage, and `/notes` asks not
 * to be indexed. Publishing one turns all of it on with no code to change.
 */
export async function hasNotes(): Promise<boolean> {
  return (await getCollection("notes")).length > 0;
}

/** Undefined when there is no Now file, which hides the section entirely. */
export async function getNow() {
  const entries = await getCollection("now");
  return entries[0];
}

export type YearGroup<T> = { year: string; rows: T[] };

/**
 * Groups by calendar year, newest year first. A year with a single row is still
 * a group — the rail never disappears just because a year was quiet.
 */
export function groupByYear<T extends { data: { created: Date } }>(
  entries: T[],
): YearGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    const key = String(entry.data.created.getUTCFullYear());
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, rows]) => ({ year, rows }));
}

export const statusLabels = {
  active: "Active",
  live: "Live",
  offline: "Offline",
} as const;

/**
 * What each badge actually promises the reader. Rendered after the label as
 * `Live — usable, …`, so no entry may contain a dash of its own.
 */
export const statusMeaning = {
  active: "usable, and I'm still adding to it",
  live: "usable, but I've stopped changing it",
  offline: "no longer usable; the page stays as a record",
} as const;
