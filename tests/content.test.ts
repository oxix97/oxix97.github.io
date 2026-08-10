import { describe, expect, it } from 'vitest';
import { byNewest, ofType, onlyPublished, publicationDate } from '../src/lib/content';

type Fixture = {
  id: string;
  data: {
    contentType: 'blog' | 'study' | 'project' | 'page';
    date?: Date;
    publishedAt?: Date;
    draft?: boolean;
  };
};

const entry = (
  id: string,
  contentType: Fixture['data']['contentType'],
  publishedAt?: string,
  draft = false,
): Fixture => ({
  id,
  data: {
    contentType,
    publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    draft,
  },
});

describe('content publishing rules', () => {
  it('removes draft entries from public results', () => {
    const entries = [
      entry('public', 'blog', '2026-08-01'),
      entry('draft', 'blog', '2026-08-02', true),
    ];

    expect(onlyPublished(entries).map((item) => item.id)).toEqual(['public']);
  });

  it('filters content by its public category', () => {
    const entries = [
      entry('article', 'blog', '2026-08-01'),
      entry('note', 'study', '2026-08-02'),
      entry('project', 'project', '2026-08-03'),
    ];

    expect(ofType(entries, ['blog', 'study']).map((item) => item.id)).toEqual([
      'article',
      'note',
    ]);
  });

  it('sorts newest first without mutating the input', () => {
    const entries = [
      entry('old', 'blog', '2026-01-01'),
      entry('new', 'study', '2026-08-01'),
      {
        id: 'newest-blog',
        data: { contentType: 'blog' as const, date: new Date('2026-08-05') },
      },
    ];

    expect(byNewest(entries).map((item) => item.id)).toEqual(['newest-blog', 'new', 'old']);
    expect(entries.map((item) => item.id)).toEqual(['old', 'new', 'newest-blog']);
  });

  it('places evergreen pages without a publication date last', () => {
    const entries = [
      entry('about', 'page'),
      entry('dated', 'blog', '2026-08-01'),
    ];

    expect(byNewest(entries).map((item) => item.id)).toEqual(['dated', 'about']);
  });

  it('uses Blog date before the legacy publishedAt field', () => {
    const blogDate = new Date('2026-08-05');
    const legacyDate = new Date('2026-08-01');
    const blogEntry = {
      id: 'blog-entry',
      data: {
        contentType: 'blog' as const,
        date: blogDate,
        publishedAt: legacyDate,
      },
    };

    expect(publicationDate(blogEntry)).toEqual(blogDate);
  });
});
