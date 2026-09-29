---
name: study-series-maintenance
description: Use when planning or changing Study series coverage, article splits or merges, order, title numbering, indexes, navigation, or existing URLs in this repository. Excludes prose-only edits and simple read-only article listings.
---

# Study series maintenance

Maintain a coherent reading sequence and working entry points. Follow [repository task scope](../../../AGENTS.md#review-and-completion-scope); planning or review requests produce proposals, not file edits.

## Establish the current series

Read the relevant articles and hub under `src/content/docs/study/`, their frontmatter, and the supplied course/PDF material when applicable. Distinguish physical file paths from public `slug` values and configured sidebar hierarchy. Inspect `astro.config.mjs`, `src/content.config.ts`, affected `tests/study-*-series.test.ts`, and `scripts/verify-build.mjs` as needed for the change.

Build a compact working map of article, central question, public URL, order, and previous/next links. Derive counts and numbering from current files; never assume a series permanently contains a fixed number of articles. Read-only listings need only the relevant metadata.

## Plan coverage and structure

When working from lectures or a PDF, map source sections/pages to existing articles and propose keep, supplement, split, merge, or add, with a reason for each material change. Distinguish source coverage from technical correctness: a lecture title alone does not establish that the article covers its content. Disclose unavailable source sections.

With metadata alone, label source-based split suggestions as provisional; do not claim that source coverage or omissions have been verified without reading the relevant material.

Use one central review question and prerequisite flow to decide boundaries. PDF page counts and lecture durations are locating aids, not automatic article lengths. Reuse sufficient explanations and visuals. Do not enlarge the series just to reach a target count unless the user has required that count.

For splits or merges, specify which content and figures move, the destination URL for each existing public URL, and changed inbound links. Preserve existing public URLs where useful; propose and implement redirects when authorized restructuring changes them. Avoid redirect chains and choose a meaningful destination rather than the series hub by default.

## Apply only the authorized change

- For numbered series, derive the prefix from `sidebar.order` and the series' current convention (for example `01. 제목`). Replace an existing prefix rather than duplicating it; exclude the hub unless requested. Do not introduce numbering into unrelated series.
- A title-only request changes the title and necessary dependent checks, not body prose or unrelated navigation labels. A reorder may also require numbering, hub order, and previous/next links to change.
- For structural changes, update affected hub links, adjacent article navigation, parent summaries/counts, and sidebar configuration where necessary. A physical move does not automatically require a public URL change.
- Use `writing-review-blog` for changed article prose and its diagram guide for changed visuals. Do not impose the article template on the hub.

## Verify the relationship, not a historical count

Inspect affected tests and build contracts before declaring completion. Update stale title/order/route expectations to the intended behavior without weakening checks merely to make them pass. Check:

- expected articles appear once, with consistent order and numbering;
- hub links resolve to the intended public URLs;
- previous/next links are reciprocal, with valid first/last boundaries;
- changed old URLs reach the intended destination without loops;
- moved content and figures remain reachable, and rendered sidebar placement matches the request.

Run the relevant existing series tests and build/artifact checks for structural changes. For narrow metadata changes, run the affected contracts; broaden only when needed. Respect explicit test constraints and report omitted checks. Prose matching tests do not prove technical accuracy.

Report what was kept, moved, added, or removed, affected URLs, checks performed, and any remaining limitation. A request to edit a series does not authorize publishing; use `github-pages-release-check` when commit, push, or deployment work is requested.
