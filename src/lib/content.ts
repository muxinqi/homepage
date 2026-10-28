import { getCollection, type CollectionEntry } from "astro:content";
import { dishCategories } from "@lib/dish-categories";
import { isLocale, locales, type Locale } from "@i18n/locales";
import { useTranslations } from "@i18n/ui";

/**
 * There is no draft flag. The branch is the draft: this repository is public, so
 * a `draft: true` file was already readable as Markdown on github.com the moment
 * it was pushed — the flag hid it from one of two doors. Unfinished work stays on
 * a branch, where `npm run dev` and the Cloudflare preview build can both reach
 * it, and merging to `main` is what publishes.
 *
 * Every entry is written twice, once under `en/` and once under `zh/`, with the
 * same filename. The filename is the slug in both languages, so
 * `projects/en/cosplit.md` is `/en/projects/cosplit/` and its other half is
 * `/zh/projects/cosplit/`.
 */

type Localized<T extends { id: string }> = T & { lang: Locale; slug: string };
export type Project = Localized<CollectionEntry<"projects">>;
export type Note = Localized<CollectionEntry<"notes">>;

function localize<T extends { id: string }>(entry: T): Localized<T> {
  const [lang, ...rest] = entry.id.split("/");
  if (!isLocale(lang) || rest.length === 0) {
    throw new Error(`${entry.id}: content lives under en/ or zh/, e.g. en/${entry.id}.md`);
  }
  return Object.assign(entry, { lang, slug: rest.join("/") });
}

/**
 * Checks that every entry has its other half, and that the halves agree on
 * every field that is not wording. A status changed on one side only, or a note
 * published in one language, stops the build here with the file named — rather
 * than shipping a page whose language switch leads nowhere.
 */
function pairs<T extends { id: string; data: Record<string, unknown> }>(
  collection: string,
  entries: Localized<T>[],
  shared: readonly string[],
) {
  const bySlug = new Map<string, Partial<Record<Locale, Localized<T>>>>();
  for (const entry of entries) {
    const pair = bySlug.get(entry.slug) ?? {};
    pair[entry.lang] = entry;
    bySlug.set(entry.slug, pair);
  }
  for (const [slug, pair] of bySlug) {
    const missing = locales.filter((lang) => !pair[lang]);
    if (missing.length > 0) {
      throw new Error(
        `${collection}/${slug}: no ${missing.join(", ")} version. ` +
          `Add src/content/${collection}/${missing[0]}/${slug}.md — every entry exists in both languages.`,
      );
    }
    for (const key of shared) {
      const values = locales.map((lang) => JSON.stringify(pair[lang]!.data[key] ?? null));
      if (new Set(values).size > 1) {
        throw new Error(
          `${collection}/${slug}: \`${key}\` differs between languages (${values.join(" vs ")}). ` +
            `Only the wording is translated; everything else must match.`,
        );
      }
    }
  }
}

/** Newest first — the rail carries recency, so the order has to agree with it. */
function byNewest(a: { data: { created: Date } }, b: { data: { created: Date } }) {
  return b.data.created.valueOf() - a.data.created.valueOf();
}

const PROJECT_SHARED = ["status", "created", "updated", "closed", "url", "repo", "stack", "featured"] as const;
const NOTE_SHARED = ["created", "updated"] as const;

export async function getProjects(lang: Locale): Promise<Project[]> {
  const all = (await getCollection("projects")).map(localize);
  pairs("projects", all, PROJECT_SHARED);
  return all.filter((p) => p.lang === lang).sort(byNewest);
}

export async function getNotes(lang: Locale): Promise<Note[]> {
  const all = (await getCollection("notes")).map(localize);
  pairs("notes", all, NOTE_SHARED);
  return all.filter((n) => n.lang === lang).sort(byNewest);
}

/**
 * Whether the Notes section exists yet, which is what puts it in the nav.
 *
 * An empty room should not be advertised: until the first note is published
 * there is no Notes item, no Notes block on the homepage, and `/notes` asks not
 * to be indexed. Publishing one turns all of it on with no code to change. Both
 * languages answer the same, because a note only exists as a pair.
 */
export async function hasNotes(): Promise<boolean> {
  return (await getCollection("notes")).length > 0;
}

/** Undefined when there is no Now file, which hides the section entirely. */
export async function getNow(lang: Locale) {
  const all = (await getCollection("now")).map(localize);
  pairs("now", all, ["updated"]);
  return all.find((entry) => entry.lang === lang);
}

export type Dish = CollectionEntry<"dishes">;
type DishCategory = Dish["data"]["category"];

/** The menu, category by category in menu order, leaving out empty ones. */
export async function getMenu(): Promise<{ category: DishCategory; dishes: Dish[] }[]> {
  const dishes = await getCollection("dishes");
  return dishCategories
    .map((category) => ({
      category,
      dishes: dishes
        .filter((d) => d.data.category === category)
        .sort((a, b) => a.data.order - b.data.order),
    }))
    .filter((group) => group.dishes.length > 0);
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

export type ProjectStatus = Project["data"]["status"];

/**
 * Three values, decided by two facts: can you still open it, and am I still
 * changing it. The label, and what each one actually promises the reader.
 */
export function statusText(status: ProjectStatus, lang: Locale) {
  const t = useTranslations(lang);
  const keys = {
    active: ["statusActive", "meaningActive"],
    live: ["statusLive", "meaningLive"],
    offline: ["statusOffline", "meaningOffline"],
  } as const;
  const [label, meaning] = keys[status];
  return { label: t(label), meaning: t(meaning) };
}
