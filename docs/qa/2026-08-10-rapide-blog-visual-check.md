# Rapide + Blog Visual QA — 2026-08-10

## Environment

- Production preview: `pnpm preview --host 127.0.0.1 --port 4321`
- Desktop viewport: 1440 × 900
- Mobile viewport: 390 × 844
- Browser: production preview at `http://127.0.0.1:4321`

## Automated verification

- Frozen pnpm install: pass
- Astro check: pass (0 errors, 0 warnings, 3 upstream deprecation hints)
- Vitest: pass (5 files, 29 tests)
- Warning-gated production build: pass (29 pages)
- Production artifact verification: pass (30 files)
- `git diff --check`: pass

## Browser verification

- Home and primary actions: pass
- Study and preserved routes: pass
- Projects and preserved routes: pass
- Blog listing, post, author, Korean date, tags, reading metrics, recent/featured sidebar, RSS: pass
- Troubleshooting index: pass
- Korean 404: pass
- Desktop and mobile navigation: pass
- Light/dark persistence: pass
- Keyboard focus and horizontal overflow: pass
- Reduced motion: pass

## Evidence

- Desktop checks covered `/`, `/study/design-patterns/`, `/projects/stockwellness/`,
  `/blog/`, `/blog/recording-technical-decisions/`, `/troubleshooting/`, and `/404/`.
  All pages had no horizontal overflow, no graph/backlink UI, and no raw
  `starlightBlog.*` message keys.
- The Blog listing and post rendered `모든 글`, `추천 글`, `최근 글`, `태그`,
  Korean date/reading metrics, author profile, tags, and RSS. The header had one
  `개발 블로그` link.
- Mobile checks covered Home, `/study/design-patterns/introduction/`, Blog listing,
  and the Blog post. Content and code did not overflow, project cards used a single
  column, and the menu opened with Enter and closed with Escape while preserving a
  reachable Blog link.
- Keyboard focus on the search control displayed the configured 3px accent outline.
- Light and dark selections persisted after reload on both Home and the Blog post.
- Project-card hover transition is scoped to
  `@media (prefers-reduced-motion: no-preference)`, so reduced-motion users receive
  no card hover motion.

## Known limitations

- Giscus, Mermaid, analytics, automatic OG images, multilingual content, and Obsidian
  synchronization remain outside this release.
