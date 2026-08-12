# oxix97 Dev Log Style Guide

## Voice

- Write the main article in a comfortable Korean `-다` style.
- Keep technical-interview answers in polite `-습니다` style.
- Sound like a careful developer reviewing a concept, not a textbook, statute, or marketing post.
- Use conversational connectors sparingly: `그래서`, `다시 말해`, `이 차이를 알고 나면`, `표로 묶어 보면`.
- Keep emotion restrained. Natural prose must not weaken technical precision.

Open with one or two sentences explaining why the topic is worth reviewing. Prefer a real author note. When none is available and the author declines to add one, use a neutral motivation without claiming personal experience.

## Paragraph and sentence shape

Build paragraphs in the order `판단 또는 정의 → 이유 → 짧은 예시`. Give each paragraph one main point.

Review sentences longer than roughly 15–20 words and split them when two conditions, causes, or consequences are packed together. Preserve a longer sentence when splitting would damage the meaning.

Use one meaningful bold decision anchor around each major section when the section contains a practical distinction. Do not bold routine definitions merely to satisfy a count.

Example:

- Reference-like: `TIME_WAIT과 새 ISN 선택은 이런 연결 세대의 혼동을 줄인다.`
- Review-like: `그래서 TIME_WAIT이 필요하다. 새 ISN과 함께, 예전 연결의 흔적이 새 연결에 섞이는 위험을 줄인다.`

## Required article sequence

Keep this sequence unless the topic genuinely makes an optional supporting element irrelevant:

1. Review motivation
2. `핵심 요약`
3. Concept or problem explanation
4. Structure and principles
5. Code, table, or diagram when useful
6. `장점과 한계`
7. `기술면접 질문`
8. `복습 체크리스트`
9. `참고 자료`
10. Previous, series, and next navigation when the post belongs to a series

The interview questions, review checklist, and sources are required for full study posts. Code, tables, and diagrams are optional only when they do not help explain the topic.

## Preserve without unnecessary changes

When revising an existing post, preserve:

- every frontmatter field and value outside the requested scope;
- validated RFC and official-document links;
- existing SVG paths, `alt` text, captions, and figure markup;
- code semantics and language fences;
- bold sentences that act as scanning anchors;
- technical-interview and checklist section positions;
- previous, series, and next links.

Compare these artifacts before and after editing. Do not replace a working diagram or link merely to make the prose feel new.

## Personal experience boundary

Use only confusion, mistakes, motivations, and realizations explicitly supplied by the author.

Allowed with author input:

> 처음에는 ACK가 마지막으로 받은 번호라고 생각했다. 다음에 받을 번호라는 점을 알고 나니 `x+1`이 이해됐다.

Neutral fallback after the author declines to provide a note:

> ACK 번호는 면접 답변에서도 자주 섞이는 부분이라, 시퀀스 공간을 기준으로 다시 구분할 필요가 있다.

Never transform a common misconception into the author's own memory. Avoid unsupported phrases such as `내가`, `처음에는`, `매번`, `직접 겪어 보니`, and `알고 나니`.

## Tables, code, and diagrams

Keep useful tables and diagrams because they are scanning aids. Introduce them with a sentence explaining what distinction to look for, then follow them with the conclusion the reader should carry forward.

Keep code examples minimal and runnable enough to illustrate the claim. Explain why each example matters instead of narrating every line.

Reuse existing SVGs exactly during prose-only revisions. When a diagram changes for technical reasons, preserve accessible `alt` text and a concise caption.

## Technical interview questions

Keep this section after `장점과 한계`. Use three representative questions for a new post unless the source material supports a different count.

Write each answer in `-습니다` style. Lead with the direct answer, add the mechanism or reason, then give one implication or boundary. Avoid turning the answer into another full article.

## Sources and series navigation

Prefer sources in this order:

1. RFC, standard, or specification
2. Official framework or project documentation
3. Primary course or lecture material used for the series
4. High-quality secondary explanation only when primary material is insufficient

Verify that each source supports a claim in the article. Do not invent titles or URLs. Keep series navigation consistent with the actual order in the repository.

## Common failure patterns

| Failure | Correction |
| --- | --- |
| Starting immediately with a dictionary definition | Add a real or neutral reason the distinction is worth reviewing. |
| Inventing `처음에는 …라고 생각했다` | Ask for one real learning note; use a neutral fallback only after decline or explicit immediate-draft instruction. |
| Replacing accuracy with chatty language | Keep the technical claim precise and soften only sentence shape and connectors. |
| Packing several conditions into one sentence | Split by cause, rule, and consequence. |
| Dropping sources, diagrams, or navigation during revision | Compare preserved artifacts against the original before finishing. |
| Changing interview answers to `-다` | Restore `-습니다` within the interview section. |
| Bolding every definition | Bold only the practical decision or distinction worth scanning. |

## Final checklist

- [ ] Add one or two opening sentences explaining why the topic is being reviewed.
- [ ] Split sentences around 15–20 words when they carry multiple ideas.
- [ ] Include at least one real confusion or misconception only when the author supplied it; otherwise ask, or use a neutral motivation after decline.
- [ ] Preserve the sequence `핵심 요약 → 원리 → 코드·표·다이어그램 → 장점과 한계 → 기술면접 질문 → 복습 체크리스트`.
- [ ] Keep roughly one meaningful bold decision anchor per major section where a judgment exists.
- [ ] List verified RFCs, official documentation, or course material under `참고 자료`.
- [ ] Keep previous, series, and next navigation consistent with the repository.
- [ ] Keep main prose in `-다` and interview answers in `-습니다`.
- [ ] Preserve frontmatter, validated links, code behavior, and existing diagram markup during revision.
- [ ] Remove unsupported personal claims and draft-only sentinels before publication.
