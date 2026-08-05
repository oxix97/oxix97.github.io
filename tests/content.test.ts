import { describe, expect, it } from 'vitest';
import { byNewest, ofType, onlyPublished } from '../src/lib/content';

type Fixture = {
  id: string;
  data: {
    contentType: 'blog' | 'study' | 'retrospective' | 'project' | 'page';
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
    ];

    expect(byNewest(entries).map((item) => item.id)).toEqual(['new', 'old']);
    expect(entries.map((item) => item.id)).toEqual(['old', 'new']);
  });

  it('places evergreen pages without a publication date last', () => {
    const entries = [
      entry('about', 'page'),
      entry('dated', 'blog', '2026-08-01'),
    ];

    expect(byNewest(entries).map((item) => item.id)).toEqual(['dated', 'about']);
  });
});
