import { describe, expect, it } from 'vitest';
import { buildCanonicalUrl, NAV_ITEMS, SITE } from '../src/lib/site';

describe('site navigation contract', () => {
  it('keeps every public destination unique and rooted', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);

    expect(hrefs).toEqual([
      '/',
      '/blog/',
      '/study/',
      '/retrospectives/',
      '/projects/',
      '/about/',
    ]);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.every((href) => href.startsWith('/'))).toBe(true);
  });

  it('builds canonical URLs at the GitHub user-site root', () => {
    expect(buildCanonicalUrl('/projects/developer-hub/')).toBe(
      'https://oxix97.github.io/projects/developer-hub/',
    );
    expect(SITE.resume).toBe('/resume.pdf');
    expect(SITE.github).toBe('https://github.com/oxix97');
  });
});
