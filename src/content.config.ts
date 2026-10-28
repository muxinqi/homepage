import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { dishCategories } from "./lib/dish-categories";

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
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    updated: z.coerce.date(),
    items: z.array(z.object({ label: z.string(), text: z.string() })).max(4),
  }),
});


const dishText = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()).min(1),
});

/**
 * One YAML file per dish, with its photo beside it. Unlike projects and notes,
 * a dish has no body, so both languages share the file: the photo, category,
 * and heat are written once, and only the words are written twice. A missing
 * language is a schema error rather than a pairing error.
 */
const dishes = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/dishes" }),
  schema: ({ image }) =>
    z.object({
      category: z.enum(dishCategories),
      /** 0 to 3. Zero shows nothing at all. */
      spice: z.number().int().min(0).max(3),
      /** Position within its category. */
      order: z.number().int().positive(),
      /** Checked at build time: a missing file fails `astro check`. */
      photo: image(),
      en: dishText,
      zh: dishText,
    }),
});

export const collections = { projects, notes, now, dishes };
