# Starlight Obsidian Developer Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Track work
> with the checkboxes below.

**Goal:** Build a Korean developer portfolio and knowledge base whose Markdown
content, resume, search, graph/backlinks, SEO files, and GitHub Pages deployment
are production-ready at `https://oxix97.github.io`.

**Architecture:** Astro and Starlight generate static HTML from one extended
`docs` collection. `starlight-theme-obsidian` owns the long-form reading shell,
search, graph, and backlink experience. A custom Astro home page uses
`StarlightPage` plus small project-owned components to present personal branding,
featured projects, and recent records. GitHub Actions validates and deploys the
static artifact from `main`.

**Tech Stack:** Astro 7.1.6, TypeScript, `@astrojs/starlight` 0.41.6,
`starlight-theme-obsidian` 0.4.1, `starlight-site-graph` 0.5.0, Markdown/MDX,
Vitest, `@astrojs/check`, `@astrojs/rss`, GitHub Actions, GitHub Pages

## Global Constraints

- Production URL is exactly `https://oxix97.github.io`; do not set a repository
  `base` path.
- Local delivery path is exactly `/Users/chan/Desktop/gongbu/Github Pages`.
- Use one Starlight `docs` collection under `src/content/docs/`.
- Content is Markdown by default; use MDX only for reusable components.
- Apply the real Starlight Obsidian plugin. Do not copy the reference site's
  name, copy, icons, or proprietary assets.
- Keep the theme's dark Obsidian identity, purple accent, focused reading width,
  desktop rails, mobile single-column behavior, graph, and backlinks.
- Initial release has no CMS, database, auth, comments, newsletter,
  multilingual routing, or animation framework.
- Do not add React or another client framework.
- Draft content is excluded from production cards, feeds, and navigation.
- Use Node.js 22.12 or newer and commit `package-lock.json`.
- Never force-push or overwrite existing GitHub repository history.
- Every task ends with fresh verification and a focused commit.

## File Map

```text
.
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.svg
│   └── resume.pdf
├── scripts/verify-build.mjs
├── src/
│   ├── components/
│   │   ├── ContentCard.astro
│   │   ├── HomeHero.astro
│   │   ├── ProjectCard.astro
│   │   └── SectionHeading.astro
│   ├── content/docs/
│   │   ├── 404.md
│   │   ├── about.md
│   │   ├── blog/recording-technical-decisions.md
│   │   ├── projects/developer-hub.md
│   │   ├── projects/stockwellness.md
│   │   ├── retrospectives/2026-first-half.md
│   │   └── study/http-cache-control.md
│   ├── content.config.ts
│   ├── lib/
│   │   ├── content.ts
│   │   └── site.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── robots.txt.ts
│   │   └── rss.xml.ts
│   └── styles/custom.css
├── tests/
│   ├── content.test.ts
│   └── site.test.ts
└── tsconfig.json
```

---

### Task 1: Lock the Astro, Starlight, and Theme Foundation

**Files:**

- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/lib/site.ts`
- Create: `tests/site.test.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Confirm the local Node runtime**

Run:

```bash
node --version
npm --version
```

Expected: Node is at least 22.12.0. If it is older, switch runtimes before
installing packages.

- [ ] **Step 2: Initialize and install the exact compatible stack**

Run:

```bash
npm init -y
npm install astro@7.1.6 @astrojs/starlight@0.41.6 starlight-theme-obsidian@0.4.1 starlight-site-graph@0.5.0 @astrojs/rss
npm install --save-dev @astrojs/check typescript vitest
```

Expected: npm resolves the theme peer dependencies without warnings that block
installation, and both npm files exist.

- [ ] **Step 3: Define scripts and write a failing site-contract test**

Set `package.json` to ESM/private mode and add:

```json
{
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "test": "vitest run",
    "build": "astro build",
    "preview": "astro preview",
    "verify:build": "node scripts/verify-build.mjs",
    "verify": "npm run check && npm run test && npm run build && npm run verify:build"
  }
}
```

Create `tests/site.test.ts` asserting:

```ts
expect(SITE.url).toBe('https://oxix97.github.io');
expect(SITE.github).toBe('https://github.com/oxix97');
expect(SITE.resume).toBe('/resume.pdf');
expect(NAV_ITEMS.map((item) => item.href)).toEqual([
  '/', '/blog/', '/study/', '/retrospectives/', '/projects/', '/about/',
]);
```

- [ ] **Step 4: Confirm the red state**

Run: `npm test -- tests/site.test.ts`

Expected: FAIL because `src/lib/site.ts` does not exist.

- [ ] **Step 5: Implement the site contract and Starlight config**

Create `src/lib/site.ts` with immutable site metadata and navigation. Configure
`astro.config.mjs` with:

```js
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightThemeObsidian from 'starlight-theme-obsidian';

export default defineConfig({
  site: 'https://oxix97.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: "oxix97's Dev Log",
      description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
      defaultLocale: 'ko',
      plugins: [starlightThemeObsidian()],
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' }],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Blog', autogenerate: { directory: 'blog' } },
        { label: 'Study', autogenerate: { directory: 'study' } },
        { label: 'Retrospectives', autogenerate: { directory: 'retrospectives' } },
        { label: 'Projects', autogenerate: { directory: 'projects' } },
        { label: 'About', link: '/about/' },
      ],
    }),
  ],
});
```

Create strict `tsconfig.json`, Astro type references, `.gitignore`, and an empty
`src/styles/custom.css` so configuration can load.

- [ ] **Step 6: Verify config and contract**

Run:

```bash
npm test -- tests/site.test.ts
npm run check
```

Expected: all tests pass and Astro reports no diagnostics.

- [ ] **Step 7: Commit the foundation**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/lib/site.ts src/styles/custom.css tests/site.test.ts .gitignore
git commit -m "chore: scaffold Starlight Obsidian site"
```

---

### Task 2: Extend the Docs Schema and Publishing Rules

**Files:**

- Create: `src/content.config.ts`
- Create: `src/lib/content.ts`
- Create: `tests/content.test.ts`

- [ ] **Step 1: Write failing publishing-rule tests**

Test pure helpers with small fixture objects:

- drafts are removed;
- content can be filtered by `contentType`;
- records sort newest first without mutating input;
- entries without `publishedAt` sort after dated records.

- [ ] **Step 2: Confirm the red state**

Run: `npm test -- tests/content.test.ts`

Expected: FAIL because `src/lib/content.ts` does not exist.

- [ ] **Step 3: Implement pure content helpers**

Create typed `onlyPublished()`, `ofType()`, and `byNewest()` functions. They must
accept readonly arrays and return new arrays.

- [ ] **Step 4: Extend Starlight's docs schema**

Use `docsLoader()` and `docsSchema({ extend })`:

```ts
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { pageThemeObsidianSchema } from 'starlight-theme-obsidian/schema';

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
    schema: docsSchema({ extend: pageThemeObsidianSchema.merge(customFields) }),
  }),
};
```

If the installed package exports the schema under a different documented path,
inspect its type declarations and adapt this import before proceeding. Do not
replace Starlight's base schema.

- [ ] **Step 5: Verify schema composition and helpers**

Run: `npm test -- tests/content.test.ts && npm run check`

Expected: four publishing-rule tests pass and Astro accepts the composed schema.

- [ ] **Step 6: Commit schema and helpers**

```bash
git add src/content.config.ts src/lib/content.ts tests/content.test.ts
git commit -m "feat: extend Starlight content schema"
```

---

### Task 3: Add Representative Korean Markdown Content

**Files:**

- Create: `src/content/docs/blog/recording-technical-decisions.md`
- Create: `src/content/docs/study/http-cache-control.md`
- Create: `src/content/docs/retrospectives/2026-first-half.md`
- Create: `src/content/docs/projects/stockwellness.md`
- Create: `src/content/docs/projects/developer-hub.md`
- Create: `src/content/docs/about.md`
- Create: `src/content/docs/404.md`

- [ ] **Step 1: Add one complete entry per publishing category**

Every publishable entry includes title, description, `contentType`,
`publishedAt`, tags, and type-specific metadata. Project pages include problem,
constraints, alternatives, decision, implementation, result, and next step.

Use these initial titles:

- Blog: `기술적 의사결정을 기록하는 이유`
- Study: `HTTP Cache-Control 정리`
- Retrospective: `2026년 상반기 회고`
- Project: `Stockwellness`
- Project: `Developer Hub`

Set both project entries to `featured: true`. Use relative Markdown links
between at least three related notes so backlinks and the graph have meaningful
edges.

- [ ] **Step 2: Add About and Starlight 404 pages**

`about.md` includes backend focus, principles, stack areas, GitHub, and resume.
`404.md` uses `template: splash`, disables edit links, and points visitors to
Home, Projects, and Search.

- [ ] **Step 3: Build to validate frontmatter and links**

Run: `npm run check && npm run build`

Expected: every Markdown page builds at its folder-based route with no schema
errors.

- [ ] **Step 4: Commit representative content**

```bash
git add src/content/docs
git commit -m "content: add initial developer knowledge base"
```

---

### Task 4: Customize the Obsidian Visual System and Home Page

**Files:**

- Modify: `src/styles/custom.css`
- Create: `src/components/HomeHero.astro`
- Create: `src/components/ContentCard.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/SectionHeading.astro`
- Create: `src/pages/index.astro`
- Create: `public/favicon.svg`
- Copy: `/Users/chan/Desktop/gongbu/my-portfolio/static/pdf/resume.pdf` to
  `public/resume.pdf`
- Create: `scripts/verify-build.mjs`

- [ ] **Step 1: Write the failing production-artifact contract**

`scripts/verify-build.mjs` must initially assert that `dist/index.html`,
`dist/projects/developer-hub/index.html`, `dist/about/index.html`, and
`dist/resume.pdf` exist, then check the home HTML for Korean language metadata,
`대표 프로젝트`, `최근 기록`, `/resume.pdf`, and the GitHub profile URL.

Run: `npm run build && npm run verify:build`

Expected: FAIL because the custom home and resume are missing.

- [ ] **Step 2: Apply oxix97 tokens on top of the theme**

In `src/styles/custom.css`:

- preserve the theme's dark base near `#111213`;
- use a purple accent near `hsl(258 61% 66%)`;
- keep the long-form content width near `45rem`;
- use Korean-friendly system fonts with readable 1.7–1.8 line height;
- style home hero, action links, metadata, cards, and section grids;
- preserve visible focus, 44px mobile targets, reduced motion, code overflow,
  and dark/light contrast;
- at desktop widths use up to three home columns where useful;
- below 48rem collapse all home grids to one column.

Do not replace the theme's sidebar, search, graph, or backlink components.

- [ ] **Step 3: Implement accessible home components**

Create focused components with explicit props. Cards are semantic `<article>`
elements, dates use `Intl.DateTimeFormat('ko-KR')`, status and tags are text (not
color-only), and links have descriptive accessible names.

- [ ] **Step 4: Implement `src/pages/index.astro` with `StarlightPage`**

Query the `docs` collection, apply publishing helpers, and render:

```text
Hero: "기록으로 성장하는 백엔드 개발자"
Actions: 대표 프로젝트 / 이력서 / GitHub
Focus: 문제 정의 / 기술적 판단 / 운영과 개선
Featured projects: first two featured project entries
Recent records: newest three Blog, Study, Retrospective entries
Contact: GitHub profile and resume
```

Use `StarlightPage` in splash mode so theme controls, search, metadata, and the
global shell remain consistent. Keep Projects and Resume within the first mobile
viewport where practical.

- [ ] **Step 5: Add identity assets**

Create an original simple `favicon.svg` containing an `O`/node motif in the
site accent. Copy the existing resume and confirm it is non-empty:

```bash
cp /Users/chan/Desktop/gongbu/my-portfolio/static/pdf/resume.pdf public/resume.pdf
test -s public/resume.pdf
```

- [ ] **Step 6: Verify home, theme, and production artifacts**

Run: `npm run check && npm test && npm run build && npm run verify:build`

Expected: all commands pass. Search assets are generated, and the theme plugin
builds with graph and backlink UI enabled.

- [ ] **Step 7: Commit the visual system and home**

```bash
git add src/styles/custom.css src/components src/pages/index.astro public/favicon.svg public/resume.pdf scripts/verify-build.mjs
git commit -m "feat: build Obsidian-inspired portfolio home"
```

---

### Task 5: Add RSS, Robots, and Stronger Artifact Verification

**Files:**

- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/robots.txt.ts`
- Modify: `scripts/verify-build.mjs`

- [ ] **Step 1: Extend artifact checks before implementation**

Add expected files for RSS, robots, sitemap, 404, all five representative
content pages, Pagefind search assets, and the resume. Inspect one long-form HTML
file for its title, table-of-contents markers, and theme/graph assets.

Run: `npm run build && npm run verify:build`

Expected: FAIL because RSS and robots are absent.

- [ ] **Step 2: Implement RSS and robots**

`rss.xml.ts` publishes non-draft blog, study, and retrospective entries sorted
newest first. `robots.txt.ts` allows crawling and points to
`https://oxix97.github.io/sitemap-index.xml`.

- [ ] **Step 3: Verify the complete local artifact**

Run: `npm run verify`

Expected: diagnostics, tests, build, and artifact checks all pass.

- [ ] **Step 4: Commit publishing metadata**

```bash
git add src/pages/rss.xml.ts src/pages/robots.txt.ts scripts/verify-build.mjs
git commit -m "feat: add feeds and artifact verification"
```

---

### Task 6: Responsive and Accessibility QA

**Files:**

- Modify only files proven necessary by QA.
- Create: `docs/qa/2026-08-05-local-visual-check.md`

- [ ] **Step 1: Start the exact production preview**

Run:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

- [ ] **Step 2: Inspect desktop at 1280×720**

Check home, one article, and one project. Verify sticky left navigation, focused
reading column, right graph/TOC/backlinks rail, visible search, purple focus,
working theme toggle, no clipped code, and no unexpected layout shift.

- [ ] **Step 3: Inspect mobile at 390×844**

Verify the rails collapse, navigation remains usable, cards are single-column,
body copy is readable, targets are at least 44px, and no horizontal overflow
appears.

- [ ] **Step 4: Run keyboard and content checks**

Tab through header, search, hero actions, cards, and footer. Verify a visible
focus indicator, correct heading order, descriptive image alt text, safe
external links, and useful 404 recovery links.

- [ ] **Step 5: Record results and fix only proven issues**

Write viewport, route, pass/fail result, and any corrections in the QA document.
After each correction, rerun `npm run verify` and recheck the affected viewport.

- [ ] **Step 6: Commit QA evidence and corrections**

```bash
git add docs/qa src
git commit -m "test: verify responsive Starlight experience"
```

---

### Task 7: GitHub Pages Workflow, Desktop Delivery, and Safe Publication

**Files:**

- Create: `.github/workflows/deploy.yml`
- Copy verified repository to `/Users/chan/Desktop/gongbu/Github Pages`

- [ ] **Step 1: Add the official Astro Pages workflow**

Use current official action majors from Astro's deployment guide:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run verify

  build:
    if: github.event_name != 'pull_request'
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
        with:
          node-version: 24

  deploy:
    if: github.event_name != 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

Validate YAML and rerun `npm run verify`.

- [ ] **Step 2: Commit the workflow and inspect final local history**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy developer hub to GitHub Pages"
git status --short
git log --oneline --decorate -10
```

Expected: clean worktree and focused commits.

- [ ] **Step 3: Copy the verified repository to the approved Desktop path**

Because the target is outside the Codex workspace, request filesystem approval.
Create the directory only after checking whether it already exists. If it exists
and is non-empty, stop and ask before overwriting anything. Copy hidden files,
Git history, sources, and lockfile; exclude `node_modules` and `dist`. Run
`npm ci && npm run verify` from the destination.

- [ ] **Step 4: Restore GitHub authentication**

Run `gh auth status`. The currently observed `oxix97` token is invalid, so the
user must complete `gh auth login` before any remote write. Recheck status after
login and do not print tokens.

- [ ] **Step 5: Inspect the remote before writing**

Run:

```bash
gh repo view oxix97/oxix97.github.io
git ls-remote --heads https://github.com/oxix97/oxix97.github.io.git
```

If the repository exists, fetch and inspect its default branch and contents.
Stop for explicit direction if histories conflict or existing content would be
replaced. Never force-push.

- [ ] **Step 6: Create or connect, push, and configure Pages**

Create `oxix97/oxix97.github.io` only if it does not exist. Otherwise add the
verified remote. Push `main` normally, select GitHub Actions as the Pages source
if necessary, and watch the deployment workflow to completion.

- [ ] **Step 7: Verify production**

Confirm `https://oxix97.github.io` returns success. Check Home, one article, one
project, About, RSS, sitemap, resume, search, graph, backlinks, mobile layout,
and theme toggle against the deployed asset paths.

- [ ] **Step 8: Final handoff**

Report the Desktop path, repository URL, production URL, verification commands,
workflow result, and the exact Markdown path/template for publishing the next
entry.
