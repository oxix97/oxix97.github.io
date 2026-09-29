# Repository instructions

## Scope

These instructions apply to the entire repository. A more specific `AGENTS.md` may override them for its subtree.

## Study content workflow

For drafting, revising, or reviewing files under `src/content/docs/study/`:

1. Use `$writing-review-blog` to establish author input, article structure, technical claims, sources, and repository conventions.
2. Verify technical accuracy within the requested scope before prose polishing. Prefer RFCs, standards, and official project documentation. Report unresolved or out-of-scope issues without silently changing protected artifacts.
3. If clusters of AI-writing patterns remain, use `$humanizer` in embedded mode on prose only.
4. Re-run the `$writing-review-blog` final checklist after the humanizer pass.

Do not invoke `$humanizer` for one isolated stylistic pattern. The blog skill and verified repository examples override generic humanizer rules.

## Task routing and execution

Respond in Korean unless the user requests another language. Select skills by the actual task, not incidental keywords.

- Ordinary article drafting, prose revisions, and title changes use the repository content workflow directly. Do not automatically start a Superpowers design/plan/approval cycle for these tasks. Use design planning when the user requests it or the work requires substantial architectural choices.
- Reuse the execution method, scope, and approvals already supplied for the current task. Do not ask the user to approve the same decision again or present a generic integration menu after they have specified the destination. Ask only about unresolved material choices or genuinely new authorization.
- Use `$study-series-maintenance` for series planning, splitting, merging, reordering, numbering, and navigation changes. Index-only and metadata-only work does not need the full article template or prose polishing.
- Use `$interview-content-editor` for standalone question collections under `src/content/docs/interview/`; the Study article's three-question section is a different format.
- Use `$github-pages-release-check` when asked to commit, push, publish, or diagnose missing deployed changes. Past main-branch pushes are not blanket authorization to publish future work.
- For Study prose, `writing-review-blog` owns the style. Use one conditional humanizer pass; do not automatically stack `human-writing` and `write-like-me` on top. Explicit user requests for those skills still apply.

Keep repository-specific preferences here and in repository skills rather than editing versioned plugin caches. Check current plugin behavior when diagnosing a conflict; do not assume an earlier plugin version's fixes still apply.

## Review and completion scope

For review-only requests, report findings and proposed edits without changing files. For partial revisions, fix only issues within the requested scope and report other findings separately. Evaluate checklists as checks, not as permission to expand the task. Complete independent authorized work while any dependent question is pending, and state the remaining limitation rather than claiming an unresolved item is fixed.

The personal learning-note question is conditional; follow the gate in `writing-review-blog/SKILL.md`. A neutral technical article or prose-only revision does not require a personal note.

## Protected article artifacts

This section is the authoritative preservation contract for study articles; skills and checklists refer to it rather than maintaining separate artifact lists. During prose editing, preserve unless the user explicitly requests a structural or technical change:

- frontmatter fields and values;
- heading names and section order;
- code blocks and code behavior;
- table data and figure markup, including SVG paths, alt text, and captions;
- quotations, citations, source URLs, and link targets;
- meaningful bold decision anchors;
- the technical-interview section, its intentional three-question structure, and `-습니다` answers;
- review checklist items and series navigation.

If a correction requires changing a protected artifact outside the requested scope, present the evidence and a concrete edit proposal and await authorization for that change. Continue the remaining authorized work; do not report the protected issue as corrected.

Keep main prose in comfortable `-다` style. Never invent the author's experience, confusion, opinion, or learning history. Do not apply humanizer's personality guidance unless the author supplied the underlying stance or first-person material.
