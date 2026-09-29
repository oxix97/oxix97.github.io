---
name: interview-content-editor
description: Use when importing, editing, or reviewing standalone interview question collections under src/content/docs/interview/, including category pages, numbered Q&A, and expandable answers. Excludes the interview section inside a Study article.
---

# Interview content editor

Turn supplied question material into the repository's existing question collection format. Follow [repository task scope](../../../AGENTS.md#review-and-completion-scope). Review-only requests do not modify files; formatting-only requests do not silently rewrite technical answers.

## Inspect the input and existing format

Read the supplied material and a matching category under `src/content/docs/interview/`. Inspect its index, one `.mdx` question page, the relevant `tests/*-interview.test.ts`, and current sidebar entries in `astro.config.mjs`. Reuse `.interview-question` styles in `src/styles/custom.css` rather than adding a new accordion implementation.

Inventory question numbers, question text, answers, keywords/points, and follow-up questions. Record the expected count from the source, not a fixed 100-question template. Do not infer that every new collection needs seven categories. Resolve a material mismatch between the user's requested subject and supplied material before publishing content under the wrong category; continue independent inspection while clarification is pending.

## Content and organization

- Group questions by coherent topics and existing repository conventions. Keep stable source question numbers and report duplicates or gaps. Renumber only when requested or clearly included in an approved organization plan.
- Preserve each supplied question and its answer, keywords, and follow-ups through conversion. Separate source content from surrounding chatbot offers or editing instructions; do not invent missing answers. Disclose omitted non-content material.
- For drafting or substantive editing, verify technical claims against relevant official documentation and state version-specific boundaries. Report substantive corrections with their sources. For format-only work, report out-of-scope technical corrections as proposals.
- Preserve supplied `-습니다` answers. Use a direct answer, mechanism, and meaningful limit where revision is authorized, without forcing a sentence count. Add no fabricated personal or company experience.
- Do not add the Study article's three-question section, review checklist, or full article sequence to every question page.

## Render with the existing interaction

Use native `<details class="interview-question">` and `<summary>` with the question number and text. Keep answers initially closed and allow multiple questions to stay open. Preserve code and escape syntax as needed for valid MDX.

Individual question pages currently use `tableOfContents: false` so repeated answer subheadings do not dominate the Starlight TOC. Preserve that convention unless a different navigation design is requested. Category landing pages keep their own appropriate navigation; do not disable the TOC across unrelated content.

Connect new category pages to the interview index and sidebar using actual slugs. Reuse existing learning-priority content if supplied; do not invent the author's priorities.

## Verify and report

Compare the converted inventory with the source: every intended question and answer component should appear exactly once, in the intended category and order. Check existing category tests and affected build contracts. Add or adjust meaningful coverage for counts, uniqueness, links, and interaction structure rather than asserting every sentence verbatim.

If source numbers repeat, identify source occurrences by their original position when checking conversion completeness. Report the original numbering defect separately; do not renumber or drop a question just to satisfy a uniqueness assertion.

For new or changed interaction/layout, inspect the rendered page on mobile and desktop, including keyboard activation, visible focus, initial closed state, and representative first/middle/last questions. Check that code renders as content and repeated answer headings do not reappear in the TOC. Report visual or interaction checks that could not be performed; a successful build is not a substitute.

Summarize question/category counts, source omissions, technical corrections, validation, and remaining issues. Commit/push/deployment requests use `github-pages-release-check`; conversion alone does not authorize publication.
