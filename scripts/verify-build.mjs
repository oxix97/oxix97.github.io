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
  'study/network/index.html',
  'study/network/network-performance-metrics/index.html',
  'study/network/topology-and-bottlenecks/index.html',
  'study/network/network-classification/index.html',
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
const designPatternMain = designPatternHub.match(
  /<main\b[^>]*>([\s\S]*?)<\/main>/,
);
if (!designPatternMain) {
  throw new Error('design pattern hub is missing its <main>...</main> content');
}

const expectedDesignPatternLinks = [
  { href: './introduction/', title: '디자인 패턴이란 무엇인가' },
  { href: './singleton-basics/', title: '싱글톤 패턴의 원리와 장단점' },
  { href: './singleton-implementations/', title: '싱글톤 구현 방식 비교' },
  { href: './factory-and-iterator/', title: '팩토리 패턴과 이터레이터 패턴' },
  {
    href: './dependency-injection-and-strategy/',
    title: 'DI·DIP와 전략 패턴',
  },
  { href: './observer-and-proxy/', title: '옵저버 패턴과 프록시 패턴' },
  { href: './mvc-mvp-mvvm/', title: 'MVC·MVP·MVVM과 Spring MVC' },
  { href: './flux-and-review/', title: 'Flux 패턴과 디자인 패턴 총정리' },
];
const designPatternLinks = [
  ...designPatternMain[1].matchAll(
    /<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
  ),
]
  .map(([, href, title]) => ({ href, title }))
  .filter(({ href }) => href.startsWith('./'));

if (
  JSON.stringify(designPatternLinks) !==
  JSON.stringify(expectedDesignPatternLinks)
) {
  throw new Error(
    `design pattern hub <main> links do not match the expected order: ${JSON.stringify(designPatternLinks)}`,
  );
}

const networkHub = await readFile(
  new URL('study/network/index.html', distUrl),
  'utf8',
);
const networkMain = networkHub.match(/<main\b[^>]*>([\s\S]*?)<\/main>/);
if (!networkMain) {
  throw new Error('network hub is missing its <main>...</main> content');
}

const expectedNetworkLinks = [
  {
    href: './network-performance-metrics/',
    title: '대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이',
  },
  {
    href: './topology-and-bottlenecks/',
    title: '연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석',
  },
  {
    href: './network-classification/',
    title: '유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준',
  },
];
const networkLinks = [
  ...networkMain[1].matchAll(
    /<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
  ),
]
  .map(([, href, title]) => ({ href, title }))
  .filter(({ href }) => href.startsWith('./'));

if (JSON.stringify(networkLinks) !== JSON.stringify(expectedNetworkLinks)) {
  throw new Error(
    `network hub <main> links do not match the expected order: ${JSON.stringify(networkLinks)}`,
  );
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
