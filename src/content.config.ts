import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** 项目的生命周期状态。不把停掉或没做完的东西说成还在维护。 */
const projectStatus = z.enum(["active", "shipped", "paused", "retired", "unfinished"]);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    /** 列表页显示的一句话。 */
    summary: z.string(),
    status: projectStatus,
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** 线上地址，公开且有意公开时才填。 */
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    /** 首页只展示 featured 的项目。 */
    featured: z.boolean().default(false),
    lang: z.enum(["en", "zh"]).default("en"),
    /** draft 的条目只在本地 dev 可见，永远不会进生产构建。 */
    draft: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(["en", "zh"]).default("zh"),
    draft: z.boolean().default(false),
  }),
});

/**
 * 首页的 Now 区块。放一个 current.md 就会显示，删掉整块就不渲染。
 * 没有独立页面，所以不存在"一个只有六行字的页面上写着半年前的日期"。
 */
const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
    items: z
      .array(
        z.object({
          label: z.string(),
          text: z.string(),
        })
      )
      .max(4),
  }),
});

export const collections = { projects, posts, now };
