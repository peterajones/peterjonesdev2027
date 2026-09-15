import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'; // 'z' from 'astro:content' is deprecated in Astro 7.3, removed in Astro 8
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Latest Updates changelog (shown in the navbar bell modal). Each entry is a
// file under src/content/updates/ — the filename is its unique id (rather
// than the date, since some entries share a date), frontmatter holds only
// the date, and the file body is the update's Markdown content.
const updates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/updates' }),
  schema: z.object({
    date: z.coerce.date(),
  }),
});

export const collections = { blog, updates };
