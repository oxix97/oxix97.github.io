# Rapide + Starlight Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Starlight Obsidian with Rapide, add `starlight-blog`, migrate the site to Astro 7 and pnpm, and reorganize content without breaking published Study or Project URLs.

**Architecture:** Keep one Starlight `docs` collection and static GitHub Pages output. Rapide owns `LanguageSelect`, `Pagination`, and `ThemeSelect`; `starlight-blog` runs second with `navigation: 'header-start'` and owns `SiteTitle` and `MarkdownContent`. Deliver the migration in independently green stages: toolchain, framework/theme, Blog, information architecture, home, and CI/release verification.

**Tech Stack:** Node.js 24, pnpm 11.21.0, Astro 7.2.0, Starlight 0.41.7, Rapide 0.5.2, starlight-blog 0.28.0, TypeScript, Vitest, Pagefind, GitHub Actions, GitHub Pages.

## Global Constraints

- Keep `site: 'https://oxix97.github.io'`, static output, root deployment, and `trailingSlash: 'always'`; do not add `base`.
- Pin `packageManager` to `pnpm@11.21.0`; commit only `pnpm-lock.yaml` and remove `package-lock.json` after the pnpm lockfile succeeds.
- Pin Astro to `7.2.0`, Starlight to `0.41.7`, Rapide to `0.5.2`, and starlight-blog to `0.28.0`.
- Apply Starlight plugins in this exact order: Rapide first, Blog second.
- Configure Blog with `navigation: 'header-start'`; no other integration may override `ThemeSelect`.
- Preserve all current Study, Project, About, Blog article, resume, favicon, sitemap, search, and 404 behavior unless this plan explicitly replaces it.
- Delete `src/content/docs/retrospectives/` and the `/retrospectives/` navigation entry without a redirect.
- Preserve every existing `/study/**` and `/projects/**` public URL through explicit `slug` frontmatter when physical files move.
- Do not add Giscus, analytics, Mermaid, multilingual support, automatic OG generation, or Obsidian synchronization.
- Do not create PromptHub or troubleshooting case studies without real source content.
- Use RED → GREEN → REFACTOR for every behavior change. Run the named failing command before editing production files.
- Follow repository commit format: `type: 변경 대상 작업 요약`, using only `feat`, `fix`, `refactor`, `docs`, `test`, or `chore` and no parenthesized scope.

## File Responsibility Map

- `package.json`, `.nvmrc`, `pnpm-lock.yaml`: reproducible Node and pnpm toolchain plus exact dependency graph.
- `astro.config.mjs`: static-site settings, Rapide/Blog composition, author metadata, primary sidebar.
- `src/content.config.ts`: one Starlight docs schema extended with Blog and project-specific fields.
- `src/lib/content.ts`: publication-date normalization shared by home/RSS consumers during migration.
- `src/pages/rss.xml.ts`: compatibility `/rss.xml` containing published Blog entries.
- `src/content/docs/blog/recording-technical-decisions.md`: retained first Blog post using Blog-native metadata.
- `src/content/docs/index.mdx`: Rapide-aligned landing page.
- `src/components/ProjectCard.astro`, `src/components/TechBadge.astro`: focused home-page presentation components.
- `src/styles/custom.css`: only project-specific layout and branding layered on Rapide variables.
- `scripts/verify-build.mjs`: production artifact and public route contract.
- `scripts/build.mjs`, `scripts/lib/build-log.mjs`: real Astro build runner and duplicate-override warning gate.
- `tests/content.test.ts`: publication-date behavior.
- `tests/build-log.test.ts`: build-warning classifier behavior.
- `tests/study-design-pattern-series.test.ts`, `tests/study-network-series.test.ts`: retained study-series contracts after physical moves.
- `.github/workflows/ci.yml`: pull-request verification.
- `.github/workflows/deploy.yml`: verified `main` build and Pages deployment.
- `README.md`: local authoring, verification, content placement, and deployment instructions.

---

### Task 1: Migrate the Existing Green Site from npm to pnpm

**Files:**
- Create: `.nvmrc`
- Create: `pnpm-lock.yaml` using pnpm 11.21.0
- Modify: `package.json`
- Delete: `package-lock.json`

**Interfaces:**
- Consumes: the current exact Astro 5/Starlight Obsidian dependency set.
- Produces: `packageManager: "pnpm@11.21.0"`, Node `>=22.12.0`, `.nvmrc` value `24`, and a frozen pnpm lockfile used by all later tasks.

- [ ] **Step 1: Verify the current npm baseline before changing package management**

Run:

```bash
nvm install 24
nvm use 24
node --version
npm run verify
```

Expected: Node reports `v24.x`; verification PASSES with 29 Vitest tests,
Astro diagnostics with zero errors, a successful static build, and successful
artifact verification.

- [ ] **Step 2: Run the pnpm frozen-install contract and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
```

Expected: FAIL with `ERR_PNPM_NO_LOCKFILE` because the repository has no `pnpm-lock.yaml` yet.

- [ ] **Step 3: Pin the Node and pnpm contract**

Add these top-level keys to `package.json` without changing dependency versions in this step:

```json
{
  "packageManager": "pnpm@11.21.0",
  "engines": {
    "node": ">=22.12.0"
  }
}
```

Create `.nvmrc` with the complete content:

```text
24
```

- [ ] **Step 4: Generate the pnpm lockfile and remove the npm lockfile**

Run:

```bash
corepack pnpm@11.21.0 install --lockfile-only
git rm package-lock.json
```

Expected: `pnpm-lock.yaml` is created, `package-lock.json` is staged for deletion, and `package.json` dependency versions are unchanged.

- [ ] **Step 5: Verify GREEN from the frozen lockfile**

Run:

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 run verify
```

Expected: both commands PASS with the same routes and tests as the npm baseline.

- [ ] **Step 6: Commit the package-manager migration**

```bash
git add .nvmrc package.json pnpm-lock.yaml package-lock.json
git commit -m "chore: github-pages pnpm 도구 체인 전환"
```

---

### Task 2: Upgrade Astro/Starlight and Replace Obsidian with Rapide Atomically

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `astro.config.mjs`
- Modify: `src/content.config.ts`
- Modify: `src/styles/custom.css`
- Modify: `scripts/verify-build.mjs`
- Modify: every Markdown file containing `graph:` or `backlinks:` frontmatter
- Delete: `src/lib/browser-micromatch.ts`
- Delete: `tests/browser-micromatch.test.ts`
- Delete: `src/content/i18n/ko.json`

**Interfaces:**
- Consumes: frozen pnpm toolchain from Task 1 and existing public route contract.
- Produces: Astro 7.2.0 + Starlight 0.41.7 output styled by Rapide 0.5.2, with no graph/backlink runtime or Obsidian package.

- [ ] **Step 1: Change the artifact contract to require Rapide and reject graph UI**

In `scripts/verify-build.mjs`, import `readdir` and add an output-level theme check:

```js
import { access, readFile, readdir } from 'node:fs/promises';

const astroDir = new URL('_astro/', distUrl);
const cssFiles = (await readdir(astroDir)).filter((file) => file.endsWith('.css'));
const cssBundle = (
  await Promise.all(cssFiles.map((file) => readFile(new URL(file, astroDir), 'utf8')))
).join('\n');

if (!cssBundle.includes('--sl-rapide-ui-border-color')) {
  throw new Error('production CSS is missing the Rapide theme variables');
}
```

Remove `sitegraph/sitemap.json` from `expectedFiles`. Replace the old positive graph/backlink assertions with negative assertions against the representative project page:

```js
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
```

- [ ] **Step 2: Run the new theme contract and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: `verify:build` FAILS with `production CSS is missing the Rapide theme variables` because Obsidian is still installed.

- [ ] **Step 3: Replace the incompatible dependency graph**

Run:

```bash
corepack pnpm@11.21.0 remove starlight-theme-obsidian starlight-site-graph
corepack pnpm@11.21.0 add --save-exact astro@7.2.0 @astrojs/starlight@0.41.7 starlight-theme-rapide@0.5.2
```

Confirm `package.json` contains these exact production dependencies:

```json
{
  "dependencies": {
    "@astrojs/rss": "4.0.19",
    "@astrojs/starlight": "0.41.7",
    "astro": "7.2.0",
    "starlight-theme-rapide": "0.5.2"
  }
}
```

- [ ] **Step 4: Configure Rapide and remove the graph browser alias**

Replace the imports and graph-specific Vite configuration in `astro.config.mjs` with this base configuration; keep the existing title, locale, social link, sidebar labels, and custom CSS reference:

```js
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightThemeRapide from 'starlight-theme-rapide';

export default defineConfig({
  site: 'https://oxix97.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: "oxix97's Dev Log",
      description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
      disable404Route: true,
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      plugins: [starlightThemeRapide()],
      customCss: ['./src/styles/custom.css'],
      components: {
        PageTitle: './src/components/StarlightPageTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Blog', link: '/blog/' },
        { label: 'Study', autogenerate: { directory: 'study' } },
        { label: 'Retrospectives', autogenerate: { directory: 'retrospectives' } },
        { label: 'Projects', autogenerate: { directory: 'projects' } },
        { label: 'About', link: '/about/' },
      ],
    }),
  ],
});
```

- [ ] **Step 5: Remove Obsidian schema extensions and content flags**

Change `src/content.config.ts` to use Starlight's schema plus the existing custom fields only:

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const customFields = z.object({
  contentType: z.enum(['blog', 'study', 'retrospective', 'project', 'page']),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  category: z.string().optional(),
  series: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  period: z.string().optional(),
  project: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'archived']).optional(),
  stack: z.array(z.string()).default([]),
  repository: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: customFields }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
```

Remove `graph:` and `backlinks:` frontmatter blocks from all content. Keep Starlight's standard table-of-contents behavior.

Remove the two top-level token blocks beginning with `:root` and
`:root[data-theme='light']` from `src/styles/custom.css`. Keep the remaining
layout rules until Task 5 replaces the file. This is required because unlayered
project variables would otherwise override Rapide's layered light/dark tokens.

- [ ] **Step 6: Delete the obsolete graph compatibility implementation**

Run:

```bash
git rm src/lib/browser-micromatch.ts tests/browser-micromatch.test.ts src/content/i18n/ko.json
rg -n "starlight-site-graph|starlight-theme-obsidian|browser-micromatch|graph:|backlinks:" . --glob '!node_modules/**' --glob '!docs/superpowers/**'
```

Expected: the final `rg` command returns no matches.

- [ ] **Step 7: Verify GREEN on the new framework and theme**

Run:

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 run check
corepack pnpm@11.21.0 test
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: all commands PASS; the CSS contains Rapide variables; no graph artifact or graph UI is generated.

- [ ] **Step 8: Commit the atomic framework/theme migration**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/content.config.ts scripts/verify-build.mjs src/content src/lib src/styles/custom.css tests
git commit -m "feat: github-pages Rapide 테마 전환"
```

---

### Task 3: Add starlight-blog and Migrate the Existing Blog Post

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `astro.config.mjs`
- Modify: `src/content.config.ts`
- Modify: `src/lib/content.ts`
- Modify: `tests/content.test.ts`
- Modify: `src/pages/rss.xml.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/content/docs/blog/recording-technical-decisions.md`
- Modify: `scripts/verify-build.mjs`
- Delete: `src/content/docs/blog/index.md`

**Interfaces:**
- Consumes: Rapide plugin from Task 2 and existing `docs` collection.
- Produces: `publicationDate(entry)`, Blog-native post metadata, `/blog/`, tag/author routes, canonical `/blog/rss.xml`, structured data, and compatibility `/rss.xml`.

- [ ] **Step 1: Add a failing publication-date behavior test**

Add this test case to `tests/content.test.ts` and import `publicationDate`:

```ts
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
```

Extend the local fixture data type with `date?: Date` and add a newest-first case containing one `date`-only Blog entry.

- [ ] **Step 2: Run the unit test and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 exec vitest run tests/content.test.ts
```

Expected: FAIL because `publicationDate` is not exported.

- [ ] **Step 3: Implement publication-date normalization**

In `src/lib/content.ts`, use this shared shape and function:

```ts
type Publishable = {
  data: {
    contentType: ContentType;
    date?: Date;
    publishedAt?: Date;
    draft?: boolean;
  };
};

export function publicationDate<T extends Publishable>(entry: T): Date | undefined {
  return entry.data.date ?? entry.data.publishedAt;
}
```

Replace the two direct `publishedAt` reads inside `byNewest()` with `publicationDate(left)` and `publicationDate(right)`.

Import `publicationDate` in `src/pages/index.astro` and pass the normalized
date into `ContentCard` so a Blog entry with only `date` still renders during
the staged migration:

```astro
publishedAt={publicationDate(entry)!}
```

- [ ] **Step 4: Run the unit test and confirm GREEN**

Run:

```bash
corepack pnpm@11.21.0 exec vitest run tests/content.test.ts
```

Expected: PASS, including the new Blog date test and the existing immutability test.

- [ ] **Step 5: Extend the production artifact contract for Blog features**

Add these paths to `expectedFiles` in `scripts/verify-build.mjs`:

```js
'blog/index.html',
'blog/recording-technical-decisions/index.html',
'blog/tags/engineering/index.html',
'blog/authors/oxix97/index.html',
'blog/rss.xml',
```

Read the generated Blog post and assert real output:

```js
const blogPost = await readFile(
  new URL('blog/recording-technical-decisions/index.html', distUrl),
  'utf8',
);
for (const requiredText of ['oxix97', 'engineering', 'BlogPosting']) {
  if (!blogPost.includes(requiredText)) {
    throw new Error(`blog post is missing Blog output: ${requiredText}`);
  }
}
```

- [ ] **Step 6: Run the Blog artifact contract and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: FAIL because `blog/tags/engineering/index.html`, the author page, and `blog/rss.xml` do not exist.

- [ ] **Step 7: Install and configure Blog after Rapide**

Run:

```bash
corepack pnpm@11.21.0 add --save-exact starlight-blog@0.28.0
```

Update the Starlight imports and plugin array in `astro.config.mjs`:

```js
import starlightBlog from 'starlight-blog';
import starlightThemeRapide from 'starlight-theme-rapide';

plugins: [
  starlightThemeRapide(),
  starlightBlog({
    title: '개발 블로그',
    prefix: 'blog',
    navigation: 'header-start',
    authors: {
      oxix97: {
        name: 'oxix97',
        title: 'Backend Developer',
        url: 'https://github.com/oxix97',
      },
    },
    metrics: {
      readingTime: true,
      words: 'rounded',
    },
    postCount: 5,
    recentPostCount: 5,
    rss: true,
    structuredData: true,
  }),
],
```

Remove the manual `{ label: 'Blog', link: '/blog/' }` entry from the Starlight
sidebar in the same edit. With `navigation: 'header-start'`, Blog renders the
desktop header link and injects its own mobile sidebar link; retaining the
manual entry would create a duplicate on mobile.

- [ ] **Step 8: Extend the docs schema with Blog fields**

Import Blog's schema and replace the docs schema callback in `src/content.config.ts`:

```ts
import { blogSchema } from 'starlight-blog/schema';

docs: defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: (context) => blogSchema(context).merge(customFields),
  }),
}),
```

The existing `tags` and `featured` fields in `customFields` remain compatible with Blog. Keep `publishedAt` temporarily for Study and Project content.

- [ ] **Step 9: Convert the existing post and remove the manual Blog index**

Use this frontmatter in `src/content/docs/blog/recording-technical-decisions.md`, keeping the article body unchanged:

```yaml
---
title: 기술적 의사결정을 기록하는 이유
description: 구현 결과뿐 아니라 선택의 맥락과 트레이드오프를 남기는 개발 기록 방식을 설명합니다.
contentType: blog
date: 2026-08-05
authors: oxix97
excerpt: 문제와 제약, 선택지, 판단 기준, 결과를 함께 남겨 다음 의사결정의 품질을 높이는 기록 방식을 설명합니다.
tags: [engineering, architecture, decision-records]
featured: true
---
```

Delete the manual index so Blog's injected `/blog/` route is the only owner:

```bash
git rm src/content/docs/blog/index.md
```

- [ ] **Step 10: Make the root RSS route a Blog compatibility feed**

Change `src/pages/rss.xml.ts` to filter only Blog entries and use `publicationDate`:

```ts
import { byNewest, ofType, onlyPublished, publicationDate } from '../lib/content';

export async function GET(context: APIContext) {
  const entries = byNewest(
    ofType(onlyPublished(await getCollection('docs')), ['blog']),
  );

  return rss({
    title: `${SITE.title} Blog`,
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
```

- [ ] **Step 11: Verify Blog GREEN and check override ownership**

Run:

```bash
corepack pnpm@11.21.0 run check
corepack pnpm@11.21.0 test
corepack pnpm@11.21.0 run build 2>&1 | tee /tmp/rapide-blog-task3-build.log
corepack pnpm@11.21.0 run verify:build
rg -n "already have a .* component override" /tmp/rapide-blog-task3-build.log
```

Expected: check, tests, build, and artifact verification PASS. The final `rg` returns no matches, proving Blog did not contest Rapide's `ThemeSelect`.

- [ ] **Step 12: Commit Blog integration**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/content.config.ts src/lib/content.ts tests/content.test.ts src/pages/rss.xml.ts src/pages/index.astro src/content/docs/blog scripts/verify-build.mjs
git commit -m "feat: github-pages Starlight Blog 통합"
```

---

### Task 4: Reorganize Content and Remove Retrospectives Without Breaking Routes

**Files:**
- Create: `src/content/docs/study/cs/index.mdx`
- Create: `src/content/docs/troubleshooting/index.mdx`
- Move: `src/content/docs/study/design-patterns/*` → `src/content/docs/study/cs/design-pattern/*`
- Move: `src/content/docs/study/network/*` → `src/content/docs/study/cs/network/*`
- Move: `src/content/docs/study/http-cache-control.md` → `src/content/docs/study/cs/network/http-cache-control.md`
- Move: `src/content/docs/projects/developer-hub.md` → `src/content/docs/projects/developer-hub/index.mdx`
- Move: `src/content/docs/projects/stockwellness.md` → `src/content/docs/projects/stockwellness/index.mdx`
- Rename: `src/content/docs/projects/index.md` → `src/content/docs/projects/index.mdx`
- Modify: `src/content/docs/study/index.md`
- Modify: `src/content.config.ts`
- Modify: `src/lib/content.ts`
- Modify: `src/lib/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `astro.config.mjs`
- Modify: `tests/content.test.ts`
- Modify: `tests/site.test.ts`
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `tests/study-network-series.test.ts`
- Modify: `scripts/verify-build.mjs`
- Delete: `src/content/docs/retrospectives/index.md`
- Delete: `src/content/docs/retrospectives/2026-first-half.md`

**Interfaces:**
- Consumes: Blog route ownership and existing public Study/Project URLs.
- Produces: Home, Study, Troubleshooting, Projects, Blog, About navigation; physical CS hierarchy; no Retrospectives route; unchanged published Study/Project routes.

- [ ] **Step 1: Add failing public-route and removal contracts**

In `tests/site.test.ts`, change the expected navigation to:

```ts
expect(hrefs).toEqual([
  '/',
  '/study/',
  '/troubleshooting/',
  '/projects/',
  '/blog/',
  '/about/',
]);
```

In `scripts/verify-build.mjs`, add `troubleshooting/index.html` to `expectedFiles`, remove `retrospectives/2026-first-half/index.html`, and add:

```js
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
```

Keep every existing design-pattern, network, HTTP cache, and project path in `expectedFiles`.

- [ ] **Step 2: Run route contracts and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 exec vitest run tests/site.test.ts
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: the site unit test FAILS because navigation still contains Retrospectives, and artifact verification FAILS because Troubleshooting is absent and Retrospectives still exists.

- [ ] **Step 3: Create the physical knowledge hierarchy**

Run the directory and Git-aware moves:

```bash
mkdir -p src/content/docs/study/cs/design-pattern src/content/docs/study/cs/network
mkdir -p src/content/docs/projects/developer-hub src/content/docs/projects/stockwellness
git mv src/content/docs/study/design-patterns/* src/content/docs/study/cs/design-pattern/
git mv src/content/docs/study/network/* src/content/docs/study/cs/network/
git mv src/content/docs/study/http-cache-control.md src/content/docs/study/cs/network/http-cache-control.md
git mv src/content/docs/projects/developer-hub.md src/content/docs/projects/developer-hub/index.mdx
git mv src/content/docs/projects/stockwellness.md src/content/docs/projects/stockwellness/index.mdx
git mv src/content/docs/projects/index.md src/content/docs/projects/index.mdx
```

Add these exact `slug` values to the moved files:

| File | `slug` |
|---|---|
| `study/cs/design-pattern/index.md` | `study/design-patterns` |
| `study/cs/design-pattern/introduction.md` | `study/design-patterns/introduction` |
| `study/cs/design-pattern/singleton-basics.md` | `study/design-patterns/singleton-basics` |
| `study/cs/design-pattern/singleton-implementations.md` | `study/design-patterns/singleton-implementations` |
| `study/cs/design-pattern/factory-and-iterator.md` | `study/design-patterns/factory-and-iterator` |
| `study/cs/design-pattern/dependency-injection-and-strategy.md` | `study/design-patterns/dependency-injection-and-strategy` |
| `study/cs/design-pattern/observer-and-proxy.md` | `study/design-patterns/observer-and-proxy` |
| `study/cs/design-pattern/mvc-mvp-mvvm.md` | `study/design-patterns/mvc-mvp-mvvm` |
| `study/cs/design-pattern/flux-and-review.md` | `study/design-patterns/flux-and-review` |
| `study/cs/network/index.md` | `study/network` |
| `study/cs/network/network-performance-metrics.md` | `study/network/network-performance-metrics` |
| `study/cs/network/topology-and-bottlenecks.md` | `study/network/topology-and-bottlenecks` |
| `study/cs/network/network-classification.md` | `study/network/network-classification` |
| `study/cs/network/http-cache-control.md` | `study/http-cache-control` |
| `projects/developer-hub/index.mdx` | `projects/developer-hub` |
| `projects/stockwellness/index.mdx` | `projects/stockwellness` |

Do not change existing article titles, bodies, relative series navigation, or
public link targets.

- [ ] **Step 4: Add Study CS and Troubleshooting index pages**

Create `src/content/docs/study/cs/index.mdx`:

```mdx
---
title: CS
description: 백엔드 개발의 기반이 되는 컴퓨터 과학 지식을 연결해서 정리합니다.
contentType: page
sidebar:
  order: 1
---

## 학습 영역

- [Design Pattern](/study/design-patterns/): 반복되는 설계 문제와 변경 비용을 다룹니다.
- [Network](/study/network/): 통신 구조, 성능 지표, 장애 범위를 다룹니다.
```

Create `src/content/docs/troubleshooting/index.mdx`:

```mdx
---
title: Troubleshooting
description: 실제 프로젝트 문제를 증거, 대안, 선택, 검증 결과 중심으로 기록합니다.
contentType: page
sidebar:
  order: 1
---

트러블슈팅 문서는 실제로 재현하고 검증한 사례만 공개합니다.

## 기록 구조

1. 핵심 요약
2. Problem & Analysis
3. 검토한 대안
4. Action & Decision
5. 구현
6. 검증
7. Result & Limitation
8. 관련 PR·Issue·ADR
```

Update `src/content/docs/study/index.md` so its links point to `/study/design-patterns/`, `/study/network/`, and `/study/http-cache-control/` while explaining the new CS grouping.

- [ ] **Step 5: Remove Retrospectives and all dangling links**

Run:

```bash
git rm -r src/content/docs/retrospectives
rg -n "/retrospectives/|contentType: retrospective|Retrospectives" src tests astro.config.mjs scripts
```

Remove the Stockwellness paragraph that links to the deleted retrospective. Continue until the `rg` command returns no matches.

- [ ] **Step 6: Simplify the content type and navigation contracts**

Change both `ContentType` definitions to:

```ts
export type ContentType = 'blog' | 'study' | 'project' | 'page';
```

Change the Zod enum in `src/content.config.ts` to the same four values. Update test fixtures accordingly.

Replace `NAV_ITEMS` in `src/lib/site.ts` with:

```ts
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Study', href: '/study/' },
  { label: 'Troubleshooting', href: '/troubleshooting/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
] as const;
```

Use Home, Study, Troubleshooting, Projects, and About in that order in the
Starlight sidebar. Do not add a manual Blog entry: the Blog plugin owns the
desktop and mobile Blog navigation links.

In `src/pages/index.astro`, change the temporary recent-record filter to `['blog', 'study']`; this file is replaced in Task 5.

- [ ] **Step 7: Point content-series tests at the new physical files**

Keep `studyRoot` pointing to `src/content/docs/study/`. Change only the physical
paths passed to `readStudyFile()`; keep every route expectation unchanged:

```ts
// tests/study-design-pattern-series.test.ts
await readStudyFile('cs/design-pattern/index.md');
await readStudyFile(`cs/design-pattern/${article.file}`);

// tests/study-network-series.test.ts
await readStudyFile('cs/network/index.md');
await readStudyFile(`cs/network/${article.file}`);
await readStudyFile('cs/network/network-classification.md');
```

Change the two Study index link expectations from physical relative links to
their stable public links:

```ts
expect(studyIndex).toContain(
  '[CS 지식의 정석 - 디자인 패턴](/study/design-patterns/)',
);
expect(studyIndex).toContain(
  '[CS 지식의 정석 - 네트워크](/study/network/)',
);
```

- [ ] **Step 8: Verify GREEN and preserved routes**

Run:

```bash
corepack pnpm@11.21.0 run check
corepack pnpm@11.21.0 test
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: PASS; Troubleshooting exists; Retrospectives is absent; all previous Study and Project artifact paths still exist.

- [ ] **Step 9: Commit the content architecture migration**

```bash
git add astro.config.mjs src/content.config.ts src/content src/lib src/pages/index.astro tests scripts/verify-build.mjs
git commit -m "refactor: github-pages 콘텐츠 정보 구조 재편"
```

---

### Task 5: Replace the Obsidian-Specific Home Shell with a Rapide MDX Landing Page

**Files:**
- Create: `src/content/docs/index.mdx`
- Create: `src/components/TechBadge.astro`
- Modify: `src/components/ProjectCard.astro`
- Replace: `src/styles/custom.css`
- Modify: `astro.config.mjs`
- Modify: `scripts/verify-build.mjs`
- Delete: `src/pages/index.astro`
- Delete: `src/components/ContentCard.astro`
- Delete: `src/components/HomeHero.astro`
- Delete: `src/components/SectionHeading.astro`
- Delete: `src/components/StarlightPageTitle.astro`

**Interfaces:**
- Consumes: Rapide variables, retained project routes, Blog route, Resume and GitHub URLs.
- Produces: one-H1 MDX splash home, `ProjectCard` and `TechBadge` components, and project-specific CSS that does not replace Rapide's theme tokens.

- [ ] **Step 1: Change the home output contract and confirm RED**

Replace the home-specific `requiredText` values in `scripts/verify-build.mjs` with:

```js
for (const requiredText of [
  'lang="ko"',
  '기록으로 성장하는 백엔드 개발자',
  '대표 프로젝트',
  'Study에서 지식을, Blog에서 시간순 기록을',
  '/projects/stockwellness/',
  '/projects/developer-hub/',
  '/blog/',
  '/resume.pdf',
  'https://github.com/oxix97',
]) {
  if (!home.includes(requiredText)) {
    throw new Error(`dist/index.html is missing required content: ${requiredText}`);
  }
}
```

Run:

```bash
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: FAIL because the current Astro home does not contain the new Study/Blog positioning text.

- [ ] **Step 2: Create the focused technology badge component**

Create `src/components/TechBadge.astro`:

```astro
---
interface Props {
  label: string;
}

const { label } = Astro.props;
---

<span class="tech-badge">{label}</span>
```

- [ ] **Step 3: Refactor ProjectCard to compose TechBadge**

Replace `src/components/ProjectCard.astro` with:

```astro
---
import TechBadge from './TechBadge.astro';

interface Props {
  href: string;
  title: string;
  description: string;
  status: 'completed' | 'ongoing' | 'archived';
  stack: string[];
}

const { href, title, description, status, stack } = Astro.props;
const statusLabels = {
  completed: '완료',
  ongoing: '진행 중',
  archived: '보관',
} as const;
---

<article class="project-card">
  <div class="project-card__meta">
    <span class={`project-status project-status--${status}`}>{statusLabels[status]}</span>
  </div>
  <h3><a href={href}>{title}</a></h3>
  <p>{description}</p>
  <div class="project-card__stack" aria-label={`${title} 기술 스택`}>
    {stack.map((item) => <TechBadge label={item} />)}
  </div>
</article>
```

- [ ] **Step 4: Create the complete MDX landing page**

Create `src/content/docs/index.mdx`:

```mdx
---
title: 기록으로 성장하는 백엔드 개발자
description: 문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오
contentType: page
template: splash
hero:
  tagline: 문제를 구조화하고 선택의 근거를 남기며 운영 가능한 해법을 만듭니다.
  actions:
    - text: 대표 프로젝트
      link: /projects/
      icon: right-arrow
      variant: primary
    - text: 이력서
      link: /resume.pdf
      icon: document
      variant: secondary
    - text: GitHub
      link: https://github.com/oxix97
      icon: github
      variant: minimal
editUrl: false
lastUpdated: false
prev: false
next: false
---

import ProjectCard from '../../components/ProjectCard.astro';

## 어떻게 기록하는가

<div class="principle-grid">
  <article>
    <h2>문제 정의</h2>
    <p>증상과 원인을 분리하고 성공 조건을 관찰 가능한 문장으로 만듭니다.</p>
  </article>
  <article>
    <h2>기술적 판단</h2>
    <p>선택지의 장점뿐 아니라 제약, 포기한 것, 운영 비용을 함께 기록합니다.</p>
  </article>
  <article>
    <h2>운영과 개선</h2>
    <p>테스트와 지표로 결과를 확인하고 회고를 다음 작업의 규칙으로 바꿉니다.</p>
  </article>
</div>

## 대표 프로젝트

<div class="project-grid">
  <ProjectCard
    href="/projects/developer-hub/"
    title="Developer Hub"
    description="Markdown 작성 경험과 포트폴리오 전달력을 함께 설계한 Astro 기반 개발자 허브입니다."
    status="ongoing"
    stack={['Astro', 'Starlight', 'TypeScript', 'GitHub Actions']}
  />
  <ProjectCard
    href="/projects/stockwellness/"
    title="Stockwellness"
    description="주식 데이터 수집·정합성 검증·조회 경로를 분리해 운영 안정성을 높인 백엔드 프로젝트입니다."
    status="ongoing"
    stack={['Java', 'Spring Boot', 'PostgreSQL', 'Docker']}
  />
</div>

## 기록 탐색

Study에서 지식을, Blog에서 시간순 기록을, Troubleshooting에서 실제 문제 해결 과정을 찾을 수 있습니다.

<div class="section-links">
  <a href="/study/">Study</a>
  <a href="/troubleshooting/">Troubleshooting</a>
  <a href="/blog/">Blog</a>
  <a href="/about/">About</a>
</div>
```

- [ ] **Step 5: Replace custom CSS with a Rapide-layered complete stylesheet**

Replace `src/styles/custom.css` with:

```css
html {
  scroll-behavior: smooth;
}

body {
  line-height: 1.75;
  letter-spacing: -0.01em;
}

:where(a, button, input, summary):focus-visible {
  outline: 3px solid var(--sl-color-accent);
  outline-offset: 3px;
}

.sl-markdown-content :where(p, li) {
  line-height: 1.78;
}

.sl-markdown-content table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

.principle-grid,
.project-grid {
  display: grid;
  gap: 1rem;
  margin-block: 1.5rem 3rem;
}

.principle-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.project-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.principle-grid article,
.project-card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--sl-rapide-ui-border-color);
  border-radius: 0.75rem;
  background: var(--sl-color-bg-nav);
}

.principle-grid h2,
.project-card h3 {
  margin-top: 0;
  font-size: 1.15rem;
}

.principle-grid p,
.project-card p {
  color: var(--sl-color-gray-2);
}

.project-card h3 a {
  color: var(--sl-color-white);
  text-decoration: none;
}

.project-card h3 a::after {
  content: '';
  position: absolute;
  inset: 0;
}

.project-card__meta,
.project-card__stack,
.section-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-status,
.tech-badge,
.section-links a {
  border: 1px solid var(--sl-rapide-ui-border-color);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.8rem;
}

.project-status--ongoing {
  color: var(--sl-color-text-accent);
}

.tech-badge {
  color: var(--sl-color-gray-2);
}

.section-links a {
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 48rem) {
  .principle-grid,
  .project-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .project-card {
    transition: border-color 160ms ease, transform 160ms ease;
  }

  .project-card:hover {
    border-color: var(--sl-color-accent);
    transform: translateY(-2px);
  }
}
```

- [ ] **Step 6: Remove the old home route and obsolete components**

Run:

```bash
git rm src/pages/index.astro
git rm src/components/ContentCard.astro src/components/HomeHero.astro src/components/SectionHeading.astro src/components/StarlightPageTitle.astro
```

Remove the `components.PageTitle` override from `astro.config.mjs`. Starlight's standard splash page now owns the only H1.

- [ ] **Step 7: Verify GREEN for home behavior and responsive source rules**

Run:

```bash
corepack pnpm@11.21.0 run check
corepack pnpm@11.21.0 test
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: PASS; home has exactly one H1, both project links, all calls to action, and no missing imports.

- [ ] **Step 8: Commit the Rapide landing page**

```bash
git add astro.config.mjs src/content/docs/index.mdx src/components src/styles/custom.css scripts/verify-build.mjs src/pages/index.astro
git commit -m "feat: github-pages Rapide 랜딩 페이지 재구성"
```

---

### Task 6: Gate Build Warnings and Convert GitHub Actions to pnpm

**Files:**
- Create: `scripts/lib/build-log.mjs`
- Create: `scripts/build.mjs`
- Create: `tests/build-log.test.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Modify: `package.json`
- Create: `README.md`

**Interfaces:**
- Consumes: exact pnpm lockfile and final Rapide/Blog configuration.
- Produces: `findComponentOverrideWarnings(log: string): string[]`, a real Astro build runner that fails on duplicate overrides, PR verification, and verified `main` deployment.

- [ ] **Step 1: Write the failing build-warning classifier test**

Create `tests/build-log.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { findComponentOverrideWarnings } from '../scripts/lib/build-log.mjs';

describe('build warning gate', () => {
  it('rejects duplicate Starlight component overrides', () => {
    const log = [
      'It looks like you already have a `ThemeSelect` component override in your Starlight configuration.',
      'Build completed.',
    ].join('\n');

    expect(findComponentOverrideWarnings(log)).toEqual([
      'It looks like you already have a `ThemeSelect` component override in your Starlight configuration.',
    ]);
  });

  it('accepts a clean Rapide and Blog build log', () => {
    expect(findComponentOverrideWarnings('25 pages built\nComplete!')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the classifier test and confirm RED**

Run:

```bash
corepack pnpm@11.21.0 exec vitest run tests/build-log.test.ts
```

Expected: FAIL because `scripts/lib/build-log.mjs` does not exist.

- [ ] **Step 3: Implement the minimal warning classifier**

Create `scripts/lib/build-log.mjs`:

```js
const componentOverridePattern =
  /^.*already have a `(?:LanguageSelect|Pagination|ThemeSelect|SiteTitle|MarkdownContent)` component override.*$/gim;

export function findComponentOverrideWarnings(log) {
  return log.match(componentOverridePattern) ?? [];
}
```

- [ ] **Step 4: Run the classifier test and confirm GREEN**

Run:

```bash
corepack pnpm@11.21.0 exec vitest run tests/build-log.test.ts
```

Expected: both tests PASS.

- [ ] **Step 5: Create a real Astro build runner that enforces the warning gate**

Create `scripts/build.mjs`:

```js
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findComponentOverrideWarnings } from './lib/build-log.mjs';

const astroCli = fileURLToPath(new URL('../node_modules/astro/astro.js', import.meta.url));
const child = spawn(process.execPath, [astroCli, 'build'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: ['inherit', 'pipe', 'pipe'],
});

let log = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString();
    log += text;
    const destination = stream === child.stdout ? process.stdout : process.stderr;
    destination.write(text);
  });
}

const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', resolve);
});

if (exitCode !== 0) process.exit(exitCode ?? 1);

const warnings = findComponentOverrideWarnings(log);
if (warnings.length > 0) {
  console.error(`Duplicate Starlight component overrides detected:\n${warnings.join('\n')}`);
  process.exit(1);
}
```

Change the `build` script in `package.json` to:

```json
"build": "node scripts/build.mjs"
```

- [ ] **Step 6: Verify the real build runner against the final configuration**

Run:

```bash
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
```

Expected: PASS with no duplicate Starlight component override error.

- [ ] **Step 7: Create pull-request CI with pnpm**

Create `.github/workflows/ci.yml`:

```yaml
name: Verify site

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v7
      - name: Set up pnpm
        uses: pnpm/action-setup@v6
      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run checks, tests, build, and artifact verification
        run: pnpm run verify
```

- [ ] **Step 8: Convert Pages deployment to pnpm while preserving verify-before-deploy**

Remove the `pull_request` trigger from `.github/workflows/deploy.yml`. In its `verify` job, use the same pnpm setup and frozen install as `ci.yml`. Configure `withastro/action@v6` with exact inputs:

```yaml
- name: Install, build, and upload site
  uses: withastro/action@v6
  with:
    node-version: 24
    package-manager: pnpm@11.21.0
    build-cmd: pnpm run build
```

Keep `push.branches: [main]`, `workflow_dispatch`, the `verify → build → deploy` dependency chain, Pages permissions, concurrency group, and `actions/deploy-pages@v5` unchanged.

- [ ] **Step 9: Document the authoring and verification workflow**

Create `README.md` with this complete content:

````markdown
# oxix97.github.io

Backend developer portfolio and knowledge base built with Astro, Starlight,
Rapide, and starlight-blog.

## Requirements

- Node.js 24
- Corepack
- pnpm 11.21.0

## Local development

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 dev
```

## Verification

```bash
corepack pnpm@11.21.0 run verify
```

The verification pipeline runs Astro diagnostics, Vitest contracts, the
production build, duplicate Starlight override detection, and production
artifact checks.

## Content

- `src/content/docs/study/`: evergreen knowledge documents
- `src/content/docs/troubleshooting/`: verified problem-solving records
- `src/content/docs/projects/`: project context and decisions
- `src/content/docs/blog/`: chronological posts managed by starlight-blog
- `src/content/docs/about.md`: profile and work philosophy

Use Korean titles and stable lowercase English URL slugs. Do not change an
existing public slug when only a title or category changes.

## Deployment

Pull requests run `.github/workflows/ci.yml`. A successful push to `main` runs
the verified GitHub Pages deployment in `.github/workflows/deploy.yml`.
````

- [ ] **Step 10: Run complete local verification**

Run:

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 run verify
git diff --check
```

Expected: frozen install, all tests, warning-gated build, artifact verification, and whitespace checks PASS.

- [ ] **Step 11: Commit CI, build gate, and documentation**

```bash
git add package.json scripts tests/build-log.test.ts .github/workflows README.md
git commit -m "chore: github-pages pnpm 검증과 배포 구성"
```

---

### Task 7: Perform Production and Visual Release Verification

**Files:**
- Create: `docs/qa/2026-08-10-rapide-blog-visual-check.md`

**Interfaces:**
- Consumes: complete implementation from Tasks 1–6.
- Produces: reproducible release evidence for automated output, desktop/mobile layout, theme switching, navigation, and accessibility basics.

- [ ] **Step 1: Run the complete clean verification sequence**

Run:

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 run check
corepack pnpm@11.21.0 test
corepack pnpm@11.21.0 run build
corepack pnpm@11.21.0 run verify:build
git diff --check
git status --short
```

Expected: every command PASS and `git status --short` prints no paths.

- [ ] **Step 2: Start the exact production preview**

Run:

```bash
corepack pnpm@11.21.0 run preview -- --host 127.0.0.1 --port 4321
```

Keep the preview session running while completing the browser checks.

- [ ] **Step 3: Check desktop behavior at 1440 × 900**

Open these exact pages in the in-app browser:

```text
http://127.0.0.1:4321/
http://127.0.0.1:4321/study/design-patterns/
http://127.0.0.1:4321/projects/stockwellness/
http://127.0.0.1:4321/blog/
http://127.0.0.1:4321/blog/recording-technical-decisions/
http://127.0.0.1:4321/troubleshooting/
http://127.0.0.1:4321/404/
```

Verify: no horizontal overflow; Rapide header and pagination styling; one Blog header link; visible table of contents on long pages; project cards align; Blog author, date, tags, reading metrics, recent/featured sidebar, and RSS link render; no graph/backlink UI appears.

- [ ] **Step 4: Check mobile behavior at 390 × 844**

Repeat Home, one Study article, Blog listing, and Blog post. Verify: menu opens and closes by keyboard and touch; Blog remains reachable; content and code do not overflow; project cards use one column; all primary controls have visible focus and usable touch size.

- [ ] **Step 5: Check light/dark and reduced-motion behavior**

On Home and one Blog post, toggle Rapide's theme control from dark to light and back. Reload once after each selection to verify persistence. Enable reduced motion in the browser and confirm project-card hover motion is disabled by the media query.

- [ ] **Step 6: Record exact QA evidence**

Create `docs/qa/2026-08-10-rapide-blog-visual-check.md` with:

```markdown
# Rapide + Blog Visual QA — 2026-08-10

## Environment

- Production preview: `pnpm preview --host 127.0.0.1 --port 4321`
- Desktop viewport: 1440 × 900
- Mobile viewport: 390 × 844

## Automated verification

- Astro check: pass
- Vitest: pass
- Warning-gated production build: pass
- Production artifact verification: pass

## Browser verification

- Home and primary actions: pass
- Study and preserved routes: pass
- Projects and preserved routes: pass
- Blog listing, post, author, tags, metrics, recent/featured sidebar, RSS: pass
- Troubleshooting index: pass
- Korean 404: pass
- Desktop and mobile navigation: pass
- Light/dark persistence: pass
- Keyboard focus and horizontal overflow: pass
- Reduced motion: pass

## Known limitations

- Giscus, Mermaid, analytics, automatic OG images, multilingual content, and Obsidian synchronization remain outside this release.
```

If any line cannot be marked `pass`, stop and create a failing automated contract for the defect before changing implementation. Rerun the affected task's RED → GREEN cycle and then repeat this entire verification task.

- [ ] **Step 7: Commit verified QA evidence**

```bash
git add docs/qa/2026-08-10-rapide-blog-visual-check.md
git commit -m "docs: github-pages Rapide Blog 전환 검증 결과 추가"
```

- [ ] **Step 8: Confirm the branch is ready for integration**

Run:

```bash
git status --short --branch
git log --oneline main..HEAD
```

Expected: clean `feat/migrate-to-rapide-blog` worktree and seven focused implementation/verification commits after the design and plan commits.
