# Technical diagrams in Study articles

Use this guide when planning, creating, or editing explanatory diagrams. The [repository preservation contract](../../../../AGENTS.md#protected-article-artifacts) still applies: prose-only work leaves existing figure markup unchanged.

## Choose the visual by its purpose

| Reader's question | Useful form |
| --- | --- |
| How do alternatives differ on the same criteria? | Table |
| What happens first, and who sends what? | Sequence or timeline diagram |
| Which component owns a responsibility or depends on another? | Relationship diagram |
| What changed between two designs? | Before/after diagram |
| What value or condition changes the outcome? | Small worked example or chart |

Inspect existing visuals first. Reuse a sufficient diagram; add one only when it clarifies a relationship the current explanation leaves hard to follow. Do not enforce an image count or turn every table into a picture. Use precise editable diagrams for protocol/state flows; decorative images are not evidence of technical behavior.

## Connect prose and diagram

- Before the figure, name the distinction or path to follow. After it, explain the conclusion rather than repeat every label.
- Use the same actors, names, values, and terminology as the accompanying code and prose.
- Make reading order and arrow semantics explicit: data transfer, dependency, and elapsed time are different relations.
- Show ordinary flow first and mark exceptions or optional steps distinctly. Verify technical meaning against the same sources as the article.
- Keep accessible alternative text and a concise caption. For a new SVG, include appropriate title/description metadata. Explain meaning beyond color through labels or line styles.

## Verify at the actual display size

Render new or modified visuals inside the article, not only as isolated SVGs. Check a narrow mobile viewport and a desktop viewport in light and dark modes. Inspect label readability, contrast, clipping, overlap, arrow direction, and overflow at the size readers see. Do not claim a large SVG source font guarantees readable scaled text.

Review both the diagram's technical meaning and its rendered appearance. Build success or SVG parsing alone does not establish either. Recheck affected visuals after a size/layout correction. If browser or rendering access is unavailable, complete independent checks and report the visual check as unverified.
