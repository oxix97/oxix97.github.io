# Writing Review Blog Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a repository-local Codex skill that writes and revises `oxix97's Dev Log` study posts in a natural review-oriented style without inventing personal experiences or weakening technical accuracy.

**Architecture:** Keep the trigger and execution workflow in `SKILL.md`, move detailed prose rules into `references/style-guide.md`, and keep the reusable Markdown shape in `references/article-template.md`. Generate `agents/openai.yaml` with the official skill initializer, then validate structure and behavior with baseline and forward-test prompts.

**Tech Stack:** Codex Agent Skills Markdown, YAML, repository-local `.agents/skills`, skill-creator Python utilities

**Execution note:** The user selected inline execution and later waived repeated behavior tests. Three baseline requests identified the unsupported-personal-history failure; post-skill Codex scenarios were skipped, while structural and metadata validation remained mandatory.

## Global Constraints

- Install the skill at `.agents/skills/writing-review-blog/`.
- Support both new study-post drafting and existing-post revision.
- Use comfortable Korean `-다` prose while retaining `-습니다` for interview answers.
- Preserve existing frontmatter, verified sources, SVG paths and captions, bold decision anchors, and series navigation.
- Never invent the author's confusion, experience, emotion, or learning history.
- Prefer RFCs, standards, and official documentation for technical verification.
- Preserve the sequence `복습 계기 → 핵심 요약 → 개념·문제 설명 → 구조·원리 → 코드·표·다이어그램 → 장점과 한계 → 기술면접 질문 → 복습 체크리스트 → 참고 자료 → 이전·다음 글 연결`.
- Do not add scripts because the core judgments are semantic rather than mechanically enforceable.
- Do not modify or stage the unrelated `.pnpm-store/` directory.

---

### Task 1: Capture baseline behavior without the skill

**Files:**
- Read: `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`
- Read: `src/content/docs/study/cs/design-pattern/singleton-basics.md`
- Read: `src/content/docs/study/cs/network/network-performance-metrics.md`
- Create: `/tmp/writing-review-blog-baseline.md`

**Interfaces:**
- Consumes: The three existing posts and the three prompts below.
- Produces: A baseline report listing omissions, invented experiences, structural drift, and preservation failures for each prompt.

- [x] **Step 1: Run three fresh-context baseline scenarios without the new skill**

Use separate subagents with these exact prompts:

```text
Rewrite the introduction and the `ISN과 Sequence·Acknowledgement Number` section of
src/content/docs/study/cs/network/tcp-connection-lifecycle.md so it reads like a natural Korean review post.
Return the revised Markdown only.
```

```text
Draft a new oxix97 Dev Log study post about HTTP conditional requests. Match the existing study posts.
The user has not supplied any personal learning notes.
```

```text
Revise src/content/docs/study/cs/design-pattern/singleton-basics.md to sound less like reference documentation.
Preserve all metadata, diagrams, sources, interview questions, checklist items, and series links.
```

- [x] **Step 2: Record baseline failures**

Write `/tmp/writing-review-blog-baseline.md` with one section per scenario and evaluate these observable criteria:

```markdown
- Personal experience invented: yes/no + excerpt
- Missing request for author learning note: yes/no
- Main prose style preserved as -다: yes/no
- Interview-answer style preserved as -습니다: yes/no
- Frontmatter/source/SVG/navigation preserved: yes/no
- Required section sequence preserved: yes/no
- Long or formal reference-style sentences remain: yes/no + excerpt
```

- [x] **Step 3: Verify the baseline identifies at least one behavior the skill must correct**

Expected: At least one scenario either invents an author experience, fails to request a missing learning note, retains overly formal reference prose, or drops a preservation requirement. If no failure appears, rerun with a fresh subagent and the same prompt before authoring guidance.

### Task 2: Initialize and author the repository-local skill

**Files:**
- Create: `.agents/skills/writing-review-blog/SKILL.md`
- Create: `.agents/skills/writing-review-blog/agents/openai.yaml`
- Create: `.agents/skills/writing-review-blog/references/style-guide.md`
- Create: `.agents/skills/writing-review-blog/references/article-template.md`

**Interfaces:**
- Consumes: The approved design and the observed Task 1 baseline failures.
- Produces: A discoverable Agent Skill named `writing-review-blog` with UI metadata and two directly linked references.

- [x] **Step 1: Initialize the skill with the official utility**

Run:

```bash
python3 /Users/chan/.codex/skills/.system/skill-creator/scripts/init_skill.py \
  writing-review-blog \
  --path .agents/skills \
  --resources references \
  --interface 'display_name=복습형 기술 블로그 작성' \
  --interface 'short_description=oxix97 Dev Log 기술 글을 자연스러운 복습형 문체로 작성하고 다듬습니다.' \
  --interface 'default_prompt=oxix97 Dev Log의 기술 글을 복습형 문체로 작성하거나 수정해 주세요.'
```

Expected: The initializer creates the skill directory, `SKILL.md`, `agents/openai.yaml`, and `references/`.

- [x] **Step 2: Replace `SKILL.md` with the minimal execution contract**

The frontmatter must be exactly two fields and the description must express triggering conditions rather than summarize the workflow:

```yaml
---
name: writing-review-blog
description: Use when drafting, revising, or reviewing Korean technical study posts for oxix97's Dev Log, especially study series, interview-preparation articles, and posts that must match the repository's existing structure and voice.
---
```

The body must contain these executable sections in imperative form:

```text
# Writing Review Blog Posts
## Overview
## Required context
## Workflow
## Personal learning-note gate
## New-post contract
## Existing-post revision contract
## Technical accuracy and sources
## Final verification
## References
```

The personal learning-note gate must require one concise question when an author-specific confusion or experience has not been supplied. It must explicitly forbid inventing first-person history and allow progress without it only by writing a neutral motivation that makes no personal claim.

The references section must link directly to both files:

```markdown
- Read [references/style-guide.md](references/style-guide.md) before writing or revising prose.
- Read [references/article-template.md](references/article-template.md) when creating a new post or repairing article structure.
```

- [x] **Step 3: Write `references/style-guide.md`**

Include the approved rules under these headings:

```text
# oxix97 Dev Log Style Guide
## Voice
## Paragraph and sentence shape
## Required article sequence
## Preserve without unnecessary changes
## Personal experience boundary
## Tables, code, and diagrams
## Technical interview questions
## Sources and series navigation
## Common failure patterns
## Final checklist
```

The final checklist must include all seven user-supplied checks: review motivation, short sentences, one real confusion point, stable section order, bold decision anchors, sources, and series navigation.

- [x] **Step 4: Write `references/article-template.md`**

Provide a valid repository-shaped template with:

```text
YAML frontmatter fields: title, description, slug, contentType, publishedAt,
tags, series, topic, difficulty, sidebar.order

Body headings: 복습 계기 paragraph, 핵심 요약, topic-specific principle sections,
장점과 한계, 기술면접 질문 with three questions, 복습 체크리스트,
참고 자료, series navigation
```

Mark author-supplied learning notes with an explicit XML-style sentinel so it cannot be mistaken for publishable copy:

```html
<!-- AUTHOR_INPUT_REQUIRED: 실제로 헷갈렸던 지점 또는 다시 정리한 계기 -->
```

- [x] **Step 5: Check the authored files for placeholder leakage and scope drift**

Run:

```bash
rg -n 'T(O)DO|T(B)D|implement[ ]later|fill[ ]in|가상의 경험|README|CHANGELOG' .agents/skills/writing-review-blog
```

Expected: No scaffold placeholders or extraneous documentation files. The intentional `AUTHOR_INPUT_REQUIRED` sentinel is allowed only in `references/article-template.md`.

### Task 3: Validate structure and forward-test behavior

**Files:**
- Modify if required: `.agents/skills/writing-review-blog/SKILL.md`
- Modify if required: `.agents/skills/writing-review-blog/references/style-guide.md`
- Modify if required: `.agents/skills/writing-review-blog/references/article-template.md`
- Verify: `.agents/skills/writing-review-blog/agents/openai.yaml`

**Interfaces:**
- Consumes: The complete `writing-review-blog` skill and Task 1 prompts.
- Produces: A structurally valid skill whose behavior closes the observed baseline gaps.

- [x] **Step 1: Run official structural validation**

Run:

```bash
python3 /Users/chan/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/writing-review-blog
```

Expected: `Skill is valid!`

- [x] **Step 2: Skip repeated forward tests at the user's request**

The user explicitly waived further behavior tests after baseline collection. No post-skill Codex scenario was run.

The planned prefix would have been:

```text
Use $writing-review-blog at .agents/skills/writing-review-blog to complete this request.
```

Expected:

- Scenario 1 shortens and softens prose while retaining factual meaning.
- Scenario 2 asks for the author's real learning note or proceeds with neutral motivation without inventing one.
- Scenario 3 preserves frontmatter, sources, interview questions, checklist, and navigation.

- [x] **Step 3: Retain baseline findings as the authored behavior contract**

The skill directly addresses the observed failures by requiring one concise author-note question and prohibiting unsupported first-person history. Behavioral comparison was not run because the user waived it.

- [x] **Step 4: Run repository-safe final verification**

Run:

```bash
python3 /Users/chan/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/writing-review-blog
git diff --check
git status --short
```

Expected: Validation passes, no whitespace errors appear, and only the skill files plus the implementation-plan document are new or modified. `.pnpm-store/` remains untracked and unstaged.

- [ ] **Step 5: Commit the skill as one focused change**

```bash
git add .agents/skills/writing-review-blog docs/superpowers/plans/2026-08-13-writing-review-blog-skill-implementation.md
git commit -m "feat: 복습형 기술 블로그 작성 스킬 추가"
```
