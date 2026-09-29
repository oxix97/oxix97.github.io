---
name: writing-review-blog
description: Use when drafting, revising, or reviewing Korean Study article prose for oxix97's Dev Log. Covers conceptual explanations and in-article interview answers, not index-only maintenance or standalone interview question collections.
---

# Writing Review Blog Posts

## Overview

Write accurate review posts without sounding like a generic reference manual. Ground personal learning claims in author input.

## Required context

Read [references/style-guide.md](references/style-guide.md) before editing prose. For new posts or structural repairs, also read [references/article-template.md](references/article-template.md). Inspect adjacent series posts for repository conventions.

For diagram planning, creation, or authorized edits, read [references/diagram-guide.md](references/diagram-guide.md). For changes to series structure or navigation, use `study-series-maintenance` alongside this skill. Standalone interview collections use `interview-content-editor`. Do not apply the full article sequence to a hub, title-only change, or question collection.

## Workflow

1. Classify the request as a new draft, existing-post revision, or review only.
2. Inspect the target and neighboring series posts.
3. Extract the requested scope, intended reader, supplied sources, and any author learning note. For a new or substantially revised post, identify the central question the reader should be able to answer.
4. Apply the personal learning-note gate.
5. Verify technical claims with primary sources when verification is required.
6. Draft or revise using the applicable contract below.
7. Apply the humanizer coordination rule when AI-pattern clusters remain.
8. Run the final verification checklist.

## Personal learning-note gate

This section is the single source for the learning-note question condition; the style guide and template refer here. Use a neutral motivation without asking when the request does not call for personal reflection. For review-only work, identify unsupported personal claims without requiring a new author note.

When drafting or revising a personal reflection is requested, first reuse any real author note or immediate-drafting instruction already supplied in the conversation. If neither is available, ask exactly one concise question before writing the personal passage:

> 이 주제에서 실제로 헷갈렸거나 다시 정리하게 된 지점 한 가지만 알려주세요.

Never invent first-person history. While the question is pending, continue research and non-personal portions of the article. Leave only the dependent personal passage pending; silence is not a decline. If the author declines to provide a note or requests immediate drafting, use a neutral motivation with no personal claim. Do not repeat the question when the conversation already resolves it.

## New-post contract

Use the article template and actual repository conventions. Keep the required article sequence.

Derive series order and navigation from repository evidence. Do not guess missing links, dates, source URLs, or personal notes. Remove the `AUTHOR_INPUT_REQUIRED` marker before publication.

## Existing-post revision contract

Change only the requested scope. Apply the [repository preservation contract](../../../AGENTS.md#protected-article-artifacts) and [review and completion scope](../../../AGENTS.md#review-and-completion-scope). Review-only requests produce findings and proposed edits without file changes. Report out-of-scope structural or technical corrections with evidence and await authorization for those changes while completing independent authorized work.

Keep interview answers in `-습니다` even when main prose uses comfortable `-다`. Separate necessary technical corrections from stylistic edits, cite the reason, and report them.

## Technical accuracy and sources

Prefer RFCs, standards, specifications, and official project documentation. Distinguish normative behavior from implementation defaults. When sources disagree, state the applicable scope.

Do not add unverified citations or treat incorrect claims as acceptable for tone consistency. Correct verified errors within scope. Report errors in protected artifacts outside scope as pending proposals under the repository contract. Investigate unverified claims using available primary sources; ask the user only when essential information cannot be obtained independently. Do not guess or claim unresolved accuracy issues are fixed.

## Humanizer coordination

**CONDITIONAL SUB-SKILL:** Follow the [repository study workflow](../../../AGENTS.md#study-content-workflow). Use `humanizer` in embedded mode only for AI-pattern clusters in prose whose structure and claims are settled. Pending out-of-scope issues do not block independent settled passages. In review-only mode, humanizer supplies proposed wording without modifying files. The repository preservation and author-experience boundaries override generic humanizer guidance. Run final verification again for affected passages.

## Final verification

Evaluate each item in the style guide's final checklist for the requested mode and scope. For review only, report findings and proposed edits. For revisions, correct in-scope issues and compare preserved artifacts against the original; report out-of-scope findings separately. Mark non-applicable items accordingly. Do not expand the request to satisfy a checklist or claim unresolved issues are fixed. Remove draft-only sentinels before publication and verify that no unsupported personal claims were introduced.

Verify that the article provides the explanation, example, and practice question needed for review. Only the reader can demonstrate their own recall or understanding; do not claim that their learning is complete or block delivery waiting for them to pass a quiz.

## References

- Read [references/style-guide.md](references/style-guide.md) before writing or revising prose.
- Read [references/article-template.md](references/article-template.md) when creating a new post or repairing article structure.
