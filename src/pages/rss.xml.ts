import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { byNewest, ofType, onlyPublished, publicationDate } from '../lib/content';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const entries = byNewest(
    ofType(onlyPublished(await getCollection('docs')), ['blog']),
  );

  return rss({
    title: `${SITE.title} 블로그`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: entries.flatMap((entry) => {
      const pubDate = publicationDate(entry);
      if (!pubDate) return [];
      return [{
        title: entry.data.title,
        description: entry.data.description ?? '',
        pubDate,
        link: `/${entry.id}/`,
        categories: entry.data.tags,
      }];
    }),
  });
}
