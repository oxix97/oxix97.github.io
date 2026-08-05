import { access, readFile } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);

const expectedFiles = [
  'index.html',
  '404.html',
  'about/index.html',
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

const article = await readFile(
  new URL('projects/developer-hub/index.html', distUrl),
  'utf8',
);
for (const requiredText of ['<graph-component', 'slsg-backlinks-panel', '목차']) {
  if (!article.includes(requiredText)) {
    throw new Error(`project detail is missing theme UI: ${requiredText}`);
  }
}

console.log(
  `Verified ${expectedFiles.length} production files, home content, search, graph, backlinks, and TOC.`,
);
