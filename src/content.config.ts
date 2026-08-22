import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Three values, decided by two facts: can you still open it, and am I still
 * changing it. Anything about how I feel about the project goes in the body.
 */
const projectStatus = z.enum(["active", "live", "offline"]);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: projectStatus,
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Only for status: offline — the month it stopped working. */
    closed: z.coerce.date().optional(),
    url: z.url().optional(),
    repo: z.url().optional(),
    /** Shown in the detail page's metadata table, never in a list row. */
    stack: z.string().optional(),
    featured: z.boolean().default(false),
    lang: z.enum(["en", "zh"]).default("en"),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    /** Optional on purpose: a row without one is shorter, which beats filler. */
    summary: z.string().optional(),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(["en", "zh"]).default("en"),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    updated: z.coerce.date(),
    items: z.array(z.object({ label: z.string(), text: z.string() })).max(4),
  }),
});

export const collections = { projects, notes, now };
