import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Drafts are visible while developing and are dropped from every production
 * build. This matters more than usual here: a push to `main` deploys, so an
 * unfinished file must never be one merge away from being public.
 */
const includeDrafts = import.meta.env.DEV;

export type Project = CollectionEntry<"projects">;
export type Note = CollectionEntry<"notes">;

/** Newest first — the rail carries recency, so the order has to agree with it. */
function byNewest(a: { data: { created: Date } }, b: { data: { created: Date } }) {
  return b.data.created.valueOf() - a.data.created.valueOf();
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection(
    "projects",
    ({ data }) => includeDrafts || !data.draft,
  );
  return entries.sort(byNewest);
}

export async function getNotes(): Promise<Note[]> {
  const entries = await getCollection(
    "notes",
    ({ data }) => includeDrafts || !data.draft,
  );
  return entries.sort(byNewest);
}

export async function getNow() {
  const entries = await getCollection(
    "now",
    ({ data }) => includeDrafts || !data.draft,
  );
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

/** What each badge actually promises the reader, for the `title` attribute. */
export const statusMeaning = {
  active: "Usable, and I'm still adding to it",
  live: "Usable, but I've stopped changing it",
  offline: "No longer usable — the page stays as a record",
} as const;
