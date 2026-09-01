import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, SITE } from '../src/lib/site';

describe('site navigation contract', () => {
  it('keeps every public destination unique and rooted', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);

    expect(hrefs).toEqual([
      '/',
      '/study/',
      '/interview/',
      '/projects/',
      '/blog/',
      '/about/',
    ]);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.every((href) => href.startsWith('/'))).toBe(true);
  });

  it('builds canonical URLs at the GitHub user-site root', () => {
    expect(SITE.resume).toBe('/resume.pdf');
    expect(SITE.github).toBe('https://github.com/oxix97');
  });

  it('uses Korean branding and navigation labels', () => {
    expect(SITE.title).toBe('oxix97의 개발 기록');
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      '홈',
      '학습',
      '면접 질문',
      '프로젝트',
      '블로그',
      '소개',
    ]);
  });

  it('keeps public-facing fixed copy in Korean', async () => {
    const [config, home, about, notFound, rss] = await Promise.all([
      readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
      readFile(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8'),
      readFile(new URL('../src/content/docs/about.md', import.meta.url), 'utf8'),
      readFile(new URL('../src/content/docs/404.md', import.meta.url), 'utf8'),
      readFile(new URL('../src/pages/rss.xml.ts', import.meta.url), 'utf8'),
    ]);

    expect(config).toContain("title: '백엔드 개발자'");
    expect(config).toContain("{ label: '홈', link: '/' }");
    expect(config).toContain("label: '학습'");
    expect(config).toContain("label: '프로젝트'");
    expect(config).toContain("{ label: '블로그', link: '/blog/' }");
    expect(config).toContain("{ label: '소개', link: '/about/' }");
    expect(home).toContain('학습에서 지식을');
    expect(about).toContain('title: 소개');
    expect(notFound).toContain('[학습](/study/)');
    expect(rss).toContain('`${SITE.title} 블로그`');
  });
});
