import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { pageThemeObsidianSchema } from 'starlight-theme-obsidian/schema';

const customFields = z.object({
  contentType: z.enum(['blog', 'study', 'retrospective', 'project', 'page']),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  category: z.string().optional(),
  series: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  period: z.string().optional(),
  project: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'archived']).optional(),
  stack: z.array(z.string()).default([]),
  repository: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: pageThemeObsidianSchema.merge(customFields) }),
  }),
};
