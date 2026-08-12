---
name: writing-review-blog
description: Use when drafting, revising, or reviewing Korean technical study posts for oxix97's Dev Log, especially study series, interview-preparation articles, and posts that must match the repository's existing structure and voice.
---

# Writing Review Blog Posts

## Overview

Write accurate technical review posts that sound like a developer revisiting a topic, not a generic reference manual. Ground every personal learning claim in information the author supplied.

## Required context

Read [references/style-guide.md](references/style-guide.md) completely before writing or revising prose. For a new post or a structural repair, also read [references/article-template.md](references/article-template.md).

Inspect the target and adjacent series posts. Identify their frontmatter, terminology, links, code, tables, and diagram markup.

## Workflow

1. Classify the request as a new draft, existing-post revision, or review only.
2. Inspect the target and neighboring series posts.
3. Extract the requested scope, supplied sources, and author learning note.
4. Apply the personal learning-note gate.
5. Verify technical claims with primary sources when verification is required.
6. Draft or revise using the applicable contract below.
7. Run the final verification checklist.

## Personal learning-note gate

When the request calls for a personal review tone but supplies no real learning note, ask exactly one concise question before writing:

> 이 주제에서 실제로 헷갈렸거나 다시 정리하게 된 지점 한 가지만 알려주세요.

Never invent first-person history such as “처음에는 …라고 생각했다”, “매번 헷갈렸다”, or “알고 나니 이해됐다.” If the author declines to provide a note or explicitly requests immediate drafting, use a neutral motivation that makes no personal claim, such as why the distinction is commonly worth reviewing.

## New-post contract

Use the article template and actual repository conventions. Keep the required article sequence.

Derive series order and navigation from repository evidence. Do not guess missing links, dates, source URLs, or personal notes. Remove the `AUTHOR_INPUT_REQUIRED` marker before publication.

## Existing-post revision contract

Change only the requested prose scope unless the user asks for structural work. Preserve frontmatter fields and values, verified sources, SVG paths, alt text, captions, code behavior, bold decision anchors, interview-question placement, checklist placement, and series navigation.

Keep interview answers in `-습니다` even when main prose uses comfortable `-다`. Separate necessary technical corrections from stylistic edits, cite the reason, and report them.

## Technical accuracy and sources

Prefer RFCs, standards, specifications, and official project documentation. Distinguish normative behavior from implementation defaults. When sources disagree, state the applicable scope.

Do not add unverified citations or preserve incorrect claims for tone consistency. Mark unverified claims for confirmation instead of guessing.

## Final verification

Confirm every item in the style guide's final checklist. For revisions, compare preserved artifacts against the original. Remove unsupported first-person claims, template sentinels, broken links, and prose that reads like a regulation or API reference.

## References

- Read [references/style-guide.md](references/style-guide.md) before writing or revising prose.
- Read [references/article-template.md](references/article-template.md) when creating a new post or repairing article structure.
