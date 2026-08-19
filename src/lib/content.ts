import { getCollection, type CollectionEntry } from "astro:content";

/** draft 条目只在本地 dev 出现，生产构建里一定不存在。 */
const includeDrafts = import.meta.env.DEV;

function byNewest<T extends { data: { created: Date } }>(a: T, b: T) {
  return b.data.created.valueOf() - a.data.created.valueOf();
}

export async function getProjects(): Promise<CollectionEntry<"projects">[]> {
  const entries = await getCollection("projects", ({ data }) => includeDrafts || !data.draft);
  return entries.sort(byNewest);
}

export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  const entries = await getCollection("posts", ({ data }) => includeDrafts || !data.draft);
  return entries.sort(byNewest);
}

/** 首页 Now 区块的内容；没写就返回 undefined，区块整块不渲染。 */
export async function getNow(): Promise<CollectionEntry<"now"> | undefined> {
  const entries = await getCollection("now", ({ data }) => includeDrafts || !data.draft);
  return entries[0];
}

export const statusLabels: Record<CollectionEntry<"projects">["data"]["status"], string> = {
  active: "Active",
  shipped: "Shipped",
  paused: "Paused",
  retired: "Retired",
  unfinished: "Unfinished",
};
