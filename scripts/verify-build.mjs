import { access, readFile } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);

const expectedFiles = [
  'index.html',
  'about/index.html',
  'projects/developer-hub/index.html',
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

console.log(`Verified ${expectedFiles.length} production files and the home contract.`);
