import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { byNewest, ofType, onlyPublished } from '../lib/content';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const entries = byNewest(
    ofType(onlyPublished(await getCollection('docs')), [
      'blog',
      'study',
      'retrospective',
    ]),
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? '',
      pubDate: entry.data.publishedAt!,
      link: `/${entry.id}/`,
      categories: entry.data.tags,
    })),
  });
}
