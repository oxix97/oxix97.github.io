# Repository instructions

## Scope

These instructions apply to the entire repository. A more specific `AGENTS.md` may override them for its subtree.

## Study content workflow

For drafting, revising, or reviewing files under `src/content/docs/study/`:

1. Use `$writing-review-blog` to establish author input, article structure, technical claims, sources, and repository conventions.
2. Finalize technical accuracy before prose polishing. Prefer RFCs, standards, and official project documentation.
3. If clusters of AI-writing patterns remain, use `$humanizer` in embedded mode on prose only.
4. Re-run the `$writing-review-blog` final checklist after the humanizer pass.

Do not invoke `$humanizer` for one isolated stylistic pattern. The blog skill and verified repository examples override generic humanizer rules.

## Protected article artifacts

During prose editing, preserve unless the user explicitly requests a structural or technical change:

- frontmatter fields and values;
- heading names and section order;
- code blocks and code behavior;
- table data and figure markup, including SVG paths, alt text, and captions;
- quotations, citations, source URLs, and link targets;
- meaningful bold decision anchors;
- the technical-interview section, its intentional three-question structure, and `-습니다` answers;
- review checklist items and series navigation.

Keep main prose in comfortable `-다` style. Never invent the author's experience, confusion, opinion, or learning history. Do not apply humanizer's personality guidance unless the author supplied the underlying stance or first-person material.
