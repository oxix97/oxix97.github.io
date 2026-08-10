import { access, readFile } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);

const expectedFiles = [
  'index.html',
  '404.html',
  'about/index.html',
  'study/design-patterns/index.html',
  'study/design-patterns/introduction/index.html',
  'study/design-patterns/singleton-basics/index.html',
  'study/design-patterns/singleton-implementations/index.html',
  'study/design-patterns/factory-and-iterator/index.html',
  'study/design-patterns/dependency-injection-and-strategy/index.html',
  'study/design-patterns/observer-and-proxy/index.html',
  'study/design-patterns/mvc-mvp-mvvm/index.html',
  'study/design-patterns/flux-and-review/index.html',
  'blog/recording-technical-decisions/index.html',
  'study/http-cache-control/index.html',
  'retrospectives/2026-first-half/index.html',
  'projects/developer-hub/index.html',
  'projects/stockwellness/index.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  'pagefind/pagefind-entry.json',
  'sitegraph/sitemap.json',
  'resume.pdf',
];

for (const relativePath of expectedFiles) {
  await access(new URL(relativePath, distUrl));
}

const home = await readFile(new URL('index.html', distUrl), 'utf8');
for (const requiredText of [
  'lang="ko"',
  '대표 프로젝트',
  '최근 기록',
  '/resume.pdf',
  'https://github.com/oxix97',
]) {
  if (!home.includes(requiredText)) {
    throw new Error(`dist/index.html is missing required content: ${requiredText}`);
  }
}

const homeHeadingCount = (home.match(/<h1\b/g) ?? []).length;
if (homeHeadingCount !== 1) {
  throw new Error(`home must contain exactly one h1, found ${homeHeadingCount}`);
}

const notFound = await readFile(new URL('404.html', distUrl), 'utf8');
if (!notFound.includes('길을 잃은 것 같습니다')) {
  throw new Error('custom Korean 404 content was not rendered');
}

const designPatternHub = await readFile(
  new URL('study/design-patterns/index.html', distUrl),
  'utf8',
);
for (const requiredText of [
  '디자인 패턴이란 무엇인가',
  '싱글톤 패턴의 원리와 장단점',
  '싱글톤 구현 방식 비교',
  '팩토리 패턴과 이터레이터 패턴',
  'DI·DIP와 전략 패턴',
  '옵저버 패턴과 프록시 패턴',
  'MVC·MVP·MVVM과 Spring MVC',
  'Flux 패턴과 디자인 패턴 총정리',
]) {
  if (!designPatternHub.includes(requiredText)) {
    throw new Error(`design pattern hub is missing: ${requiredText}`);
  }
}

const article = await readFile(
  new URL('projects/developer-hub/index.html', distUrl),
  'utf8',
);
for (const requiredText of [
  '<graph-component',
  'slsg-backlinks-panel',
  '그래프 뷰',
  '백링크',
  '목차',
]) {
  if (!article.includes(requiredText)) {
    throw new Error(`project detail is missing theme UI: ${requiredText}`);
  }
}

console.log(
  `Verified ${expectedFiles.length} production files, home content, search, graph, backlinks, and TOC.`,
);
