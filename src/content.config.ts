import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

const customFields = z.object({
  contentType: z.enum(['blog', 'study', 'retrospective', 'project', 'page']).default('page'),
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
    schema: docsSchema({
      extend: (context) => blogSchema(context).merge(customFields),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
