# Developer Hub 제거 및 Study 헤더 링크 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Developer Hub project from the published site and make the home header’s `개발 블로그` link open `/study/` while preserving Blog routes and navigation.

**Architecture:** Disable `starlight-blog` header navigation and provide a small project `SiteTitle` wrapper that links `개발 블로그` to Study. Keep Blog discoverable through an explicit Starlight sidebar link and preserve the plugin-owned Blog pages, RSS, tags, and authors. Delete Developer Hub content and remove all runtime/content/artifact references.

**Tech Stack:** Astro 7.2.0, Starlight 0.41.7, starlight-blog 0.28.0, MDX, pnpm.

## Global Constraints

- Keep Blog routes `/blog/`, `/blog/rss.xml`, `/blog/tags/*`, and `/blog/authors/*` unchanged.
- Set the custom header link text to `개발 블로그` and its href to `/study/`.
- Keep a visible Starlight sidebar link `{ label: 'Blog', link: '/blog/' }`.
- Delete `src/content/docs/projects/developer-hub/index.mdx` without a redirect.
- Remove Developer Hub links and positive references from source content, configuration, and tests; keep only the production verifier’s explicit negative assertion that the removed output does not exist.
- Preserve `/projects/stockwellness/`, Study routes, About, search, 404, and RSS behavior.
- Do not run test commands, per the user’s explicit request; use static reference checks, build output checks when practical, and `git diff --check` only.
- Use commit messages in the repository format: `type: 변경 대상 작업 요약`, with no parenthesized scope.

---

### Task 1: Replace the automatic Blog header link with a Study-targeted SiteTitle

**Files:**
- Create: `src/components/SiteTitle.astro`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: Starlight’s default SiteTitle component and existing Rapide styles.
- Produces: a static header anchor whose visible label is `개발 블로그` and whose href is `/study/`.

- [ ] **Step 1: Configure Blog navigation ownership**

In `astro.config.mjs`, change the Blog plugin option from:

```js
navigation: 'header-start',
```

to:

```js
navigation: 'none',
```

Add the manual Blog sidebar entry and custom SiteTitle component:

```js
components: {
  SiteTitle: './src/components/SiteTitle.astro',
},
sidebar: [
  { label: 'Home', link: '/' },
  { label: 'Study', items: [{ autogenerate: { directory: 'study' } }] },
  { label: 'Troubleshooting', items: [{ autogenerate: { directory: 'troubleshooting' } }] },
  { label: 'Projects', items: [{ autogenerate: { directory: 'projects' } }] },
  { label: 'Blog', link: '/blog/' },
  { label: 'About', link: '/about/' },
],
```

- [ ] **Step 2: Create the focused SiteTitle wrapper**

Create `src/components/SiteTitle.astro`:

```astro
---
import Default from '@astrojs/starlight/components/SiteTitle.astro';
---

<Default><slot /></Default>
<div class="study-link">
  <a href="/study/">개발 블로그</a>
</div>

<style>
  .study-link {
    border-inline-start: 1px solid var(--sl-color-gray-5);
    display: none;
    gap: 1rem;
    margin-inline-start: 1rem;
    min-inline-size: 0;
    padding-inline-start: 1rem;
  }

  @media (min-width: 50rem) {
    .study-link {
      align-items: center;
      display: flex;
    }
  }

  a {
    color: var(--sl-color-text-accent);
    font-weight: 600;
    min-inline-size: 0;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 3: Perform static link checks**

Run these non-test checks:

```bash
rg -n "navigation: 'none'|SiteTitle|개발 블로그|href=\"/study/\"|label: 'Blog'" astro.config.mjs src/components/SiteTitle.astro
git diff --check
```

Expected: the custom header link and manual Blog sidebar entry are present, and no whitespace errors are reported.

- [ ] **Step 4: Commit the header navigation change**

```bash
git add astro.config.mjs src/components/SiteTitle.astro
git commit -m "feat: github-pages 개발 블로그 헤더를 Study로 연결"
```

---

### Task 2: Delete Developer Hub content and remove site references

**Files:**
- Delete: `src/content/docs/projects/developer-hub/index.mdx`
- Modify: `src/content/docs/index.mdx`
- Modify: `src/content/docs/projects/index.mdx`
- Modify: `src/content/docs/blog/recording-technical-decisions.md`
- Modify: `tests/site.test.ts`

**Interfaces:**
- Consumes: existing Stockwellness project card and stable Projects route.
- Produces: no Developer Hub page, card, link, or stale canonical-route assertion.

- [ ] **Step 1: Remove the Developer Hub project page**

Delete the file:

```bash
git rm src/content/docs/projects/developer-hub/index.mdx
```

- [ ] **Step 2: Remove the home card and Projects index link**

In `src/content/docs/index.mdx`, remove the complete `ProjectCard` whose href is `/projects/developer-hub/` and leave the Stockwellness card unchanged.

In `src/content/docs/projects/index.mdx`, remove the complete `Developer Hub` bullet and leave the Stockwellness bullet unchanged.

- [ ] **Step 3: Remove dangling Blog prose**

In `src/content/docs/blog/recording-technical-decisions.md`, replace the final Developer Hub paragraph with:

```markdown
이 원칙은 이 사이트의 Study와 프로젝트 기록에도 적용합니다. 도구 선정,
콘텐츠 구조, 배포 방식을 결과만이 아니라 판단 근거와 함께 남깁니다.
```

- [ ] **Step 4: Remove the stale canonical URL assertion**

In `tests/site.test.ts`, remove only the `buildCanonicalUrl('/projects/developer-hub/')` expectation. Keep the resume, GitHub, navigation uniqueness, and root URL assertions unchanged. Do not run the tests.

- [ ] **Step 5: Confirm no runtime/content references remain**

Run:

```bash
rg -n "developer-hub|Developer Hub" src astro.config.mjs tests README.md
```

Expected: no matches. The single `assertMissing('projects/developer-hub/index.html')` contract in `scripts/verify-build.mjs` is intentional. References in the historical design/spec/plan documents are allowed because they record the approved migration context.

- [ ] **Step 6: Commit Developer Hub removal**

```bash
git add src/content/docs/index.mdx src/content/docs/projects/index.mdx src/content/docs/blog/recording-technical-decisions.md tests/site.test.ts
git commit -m "refactor: github-pages Developer Hub 프로젝트 제거"
```

---

### Task 3: Update production artifact verification for the new routes

**Files:**
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: production `dist` output from the existing Astro build.
- Produces: a route contract that rejects Developer Hub output and checks the Study-targeted header link without removing Blog artifact coverage.

- [ ] **Step 1: Remove Developer Hub expectations**

Remove `'projects/developer-hub/index.html'` from `expectedFiles` and replace the current Developer Hub read with the preserved Stockwellness page:

```js
await assertMissing('projects/developer-hub/index.html');

const article = await readFile(
  new URL('projects/stockwellness/index.html', distUrl),
  'utf8',
);
```

Keep the existing graph/backlink-negative and `목차` assertions against `article`.

- [ ] **Step 2: Add the header destination contract**

Add `개발 블로그` and `/study/` to the home required content, then verify that they occur near one another:

```js
const studyHeaderIndex = home.indexOf('href="/study/"');
if (
  studyHeaderIndex === -1 ||
  !home.slice(studyHeaderIndex, studyHeaderIndex + 300).includes('개발 블로그')
) {
  throw new Error('home header 개발 블로그 link must point to /study/');
}
```

Remove the old `/projects/developer-hub/` required home string.

- [ ] **Step 3: Perform static verifier checks**

Run:

```bash
rg -n "projects/developer-hub|developer-hub|개발 블로그|/study/|stockwellness" scripts/verify-build.mjs
git diff --check
```

Expected: the verifier checks missing Developer Hub output, preserved Stockwellness output, and the Study-targeted header link.

- [ ] **Step 4: Commit the artifact contract**

```bash
git add scripts/verify-build.mjs
git commit -m "test: github-pages Developer Hub 제거 경로 검증 추가"
```

---

### Task 4: Final non-test validation and handoff

**Files:**
- Modify: none beyond Tasks 1–3.

- [ ] **Step 1: Run the requested static checks**

```bash
rg -n "developer-hub|Developer Hub" src astro.config.mjs tests README.md
git diff --check
git status --short --branch
```

The `rg` command must return no matches; tests are intentionally not run.

- [ ] **Step 2: Review the final diff**

Confirm the diff contains only:

- the custom SiteTitle and navigation configuration;
- Developer Hub deletion and positive-reference cleanup;
- Stockwellness-based artifact verification;
- the approved design and implementation plan documents;
- the intentional negative Developer Hub absence assertion in `scripts/verify-build.mjs`.

- [ ] **Step 3: Commit any final documentation only if needed**

No additional commit is expected when the previous tasks are clean.
