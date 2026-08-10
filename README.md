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
