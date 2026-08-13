import { access, readFile, readdir } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);

const expectedFiles = [
  'index.html',
  '404.html',
  'about/index.html',
  'troubleshooting/index.html',
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
  'study/network/tcp-ip-layers-and-encapsulation/index.html',
  'study/network/tcp-udp-mtu-mss-pmtud/index.html',
  'study/network/tcp-connection-lifecycle/index.html',
  'study/network/routing-and-routing-table/index.html',
  'blog/index.html',
  'blog/recording-technical-decisions/index.html',
  'blog/tags/engineering/index.html',
  'blog/authors/oxix97/index.html',
  'blog/rss.xml',
  'projects/stockwellness/index.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  'pagefind/pagefind-entry.json',
  'resume.pdf',
];

for (const relativePath of expectedFiles) {
  await access(new URL(relativePath, distUrl));
}

async function assertMissing(relativePath) {
  try {
    await access(new URL(relativePath, distUrl));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
  throw new Error(`unexpected production file exists: ${relativePath}`);
}

await assertMissing('retrospectives/index.html');
await assertMissing('retrospectives/2026-first-half/index.html');
await assertMissing('projects/developer-hub/index.html');
await assertMissing('study/http-cache-control/index.html');

const home = await readFile(new URL('index.html', distUrl), 'utf8');
for (const requiredText of [
  'lang="ko"',
  '기록으로 성장하는 백엔드 개발자',
  '대표 프로젝트',
  'Study에서 지식을, Blog에서 시간순 기록을',
  '/projects/stockwellness/',
  '/blog/',
  '개발 블로그',
  '/study/',
  '/resume.pdf',
  'https://github.com/oxix97',
]) {
  if (!home.includes(requiredText)) {
    throw new Error(`dist/index.html is missing required content: ${requiredText}`);
  }
}

const studyHeaderIndex = home.indexOf('href="/study/"');
if (
  studyHeaderIndex === -1 ||
  !home.slice(studyHeaderIndex, studyHeaderIndex + 300).includes('개발 블로그')
) {
  throw new Error('home header 개발 블로그 link must point to /study/');
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
  {
    href: './tcp-ip-layers-and-encapsulation/',
    title: 'TCP/IP 4계층은 데이터를 어떻게 전달하는가',
  },
  {
    href: './tcp-udp-mtu-mss-pmtud/',
    title: 'TCP와 UDP, 그리고 MTU·MSS·PMTUD',
  },
  {
    href: './tcp-connection-lifecycle/',
    title: 'TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지',
  },
  {
    href: './routing-and-routing-table/',
    title: '라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블',
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
  new URL('projects/stockwellness/index.html', distUrl),
  'utf8',
);
const blogPost = await readFile(
  new URL('blog/recording-technical-decisions/index.html', distUrl),
  'utf8',
);
for (const requiredText of ['oxix97', 'engineering', 'BlogPosting']) {
  if (!blogPost.includes(requiredText)) {
    throw new Error(`blog post is missing Blog output: ${requiredText}`);
  }
}

const blogIndex = await readFile(new URL('blog/index.html', distUrl), 'utf8');
const blogTag = await readFile(
  new URL('blog/tags/engineering/index.html', distUrl),
  'utf8',
);
const blogAuthor = await readFile(
  new URL('blog/authors/oxix97/index.html', distUrl),
  'utf8',
);
const blogArtifacts = [blogPost, blogIndex, blogTag, blogAuthor];

if (blogArtifacts.some((artifact) => artifact.includes('starlightBlog.'))) {
  throw new Error('Blog output contains unresolved starlight-blog translation keys');
}

for (const requiredText of [
  '2026년 8월 5일',
  '읽는 데',
  '모든 글',
  '최근 글',
  '태그',
  'RSS',
]) {
  if (!blogArtifacts.some((artifact) => artifact.includes(requiredText))) {
    throw new Error(`blog output is missing Korean UI text: ${requiredText}`);
  }
}
const astroDir = new URL('_astro/', distUrl);
const cssFiles = (await readdir(astroDir)).filter((file) => file.endsWith('.css'));
const cssBundle = (
  await Promise.all(cssFiles.map((file) => readFile(new URL(file, astroDir), 'utf8')))
).join('\n');

if (!cssBundle.includes('--sl-rapide-ui-border-color')) {
  throw new Error('production CSS is missing the Rapide theme variables');
}

for (const forbiddenText of ['<graph-component', 'slsg-backlinks-panel']) {
  if (article.includes(forbiddenText)) {
    throw new Error(`project detail still contains Obsidian UI: ${forbiddenText}`);
  }
}

for (const requiredText of ['목차']) {
  if (!article.includes(requiredText)) {
    throw new Error(`project detail is missing reading UI: ${requiredText}`);
  }
}

console.log(
  `Verified ${expectedFiles.length} production files, home content, search, Rapide, and TOC.`,
);
