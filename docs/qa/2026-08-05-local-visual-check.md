# Local visual check · 2026-08-05

## Scope

- Home, document detail, search, theme toggle, and 404 fallback.
- Local production preview at `http://127.0.0.1:4321/`.
- Desktop viewport: 1280 × 720.

## Results

- Home renders one `h1`, the portfolio links, project cards, recent records, and contact links.
- Home and the Developer Hub detail page have no horizontal overflow at the tested viewport.
- Developer Hub renders the Korean graph heading, a graph canvas, and the Korean backlinks heading.
- Pagefind search opens, returns `HTTP Cache-Control 정리` for `Cache-Control`, and closes when toggled again.
- Theme selection toggles between dark and light and can be restored to dark.
- An unknown route renders the Korean custom 404 page with Home and Projects links.
- The mobile breakpoint is defined at `48rem`: the home grids collapse to one column, hero actions become a two-column layout, and the primary action spans both columns.

## Automated evidence

`npm run verify` passed on 2026-08-05:

- Astro check: 0 errors, 0 warnings, 0 hints.
- Vitest: 9 tests passed.
- Static build: 12 pages generated, Pagefind indexed 11 pages.
- Artifact verification: 14 expected production files present.

## Follow-up

`npm audit --omit=dev` reports 8 findings in the current Astro 5/Starlight Obsidian dependency graph (6 low, 2 high). The available automatic upgrade requires a newer Starlight/theme integration that is not compatible with `starlight-theme-obsidian@0.4.1`; do not run `audit fix --force` without revalidating the theme. Revisit when the Obsidian theme publishes an Astro 6/7-compatible release.
