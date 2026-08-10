# 디자인 패턴 Study 연재 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inflearn `CS 지식의 정석` 섹션 2를 개인 언어로 재구성한 디자인 패턴 Study 허브와 글 8편을 게시한다.

**Architecture:** `src/content/docs/study/design-patterns/`를 독립 연재 디렉터리로 만들고, 허브 페이지와 8개 Markdown 문서를 Starlight 자동 사이드바에 연결한다. 콘텐츠 계약 테스트가 frontmatter, 공통 절, 강의 출처를 검증하고 최종 빌드 검증이 실제 정적 페이지 생성을 확인한다. 첫 글은 `draft: true`로 작성해 사용자 문체 검토를 받은 뒤 공개하고, 승인된 형식을 나머지 글에 반복 적용한다.

**Tech Stack:** Astro 5.18, Starlight 0.35, Markdown, TypeScript, Vitest 3.2, Inflearn connector

## Global Constraints

- 첫 글처럼 개념 중심인 본문은 한국어로 작성하고 코드와 표를 제외한 목표 분량을 약 1,500~2,500자로 둔다. 구현 중심의 이후 글은 판단 기준과 실패 조건을 보존해야 한다면 이 범위를 넘을 수 있다.
- 각 글은 `핵심 요약`, `장점과 한계`, `기술면접 질문`, `복습 체크리스트`, `참고 자료` 절을 포함한다.
- 각 글은 패턴 적용 전후에 새 요구가 들어왔을 때 각각 어느 코드가 바뀌는지 설명한다.
- 기술면접 질문은 글당 2~4개이며 답변은 결론 → 동작 원리 또는 판단 기준 → 사례나 한계의 세 문장으로 설명한다.
- 강의 자막이나 교안을 연속해서 옮기지 않고 설명, 표, 코드, 면접 답변을 새로 작성한다.
- 모든 글은 `series: CS 지식의 정석 - 디자인 패턴`, `topic: Design Pattern`을 사용한다.
- 모든 본문 글은 `contentType: study`, `publishedAt: 2026-08-10`, `difficulty: intermediate`를 사용하며, 사용자 검토 중인 첫 글만 `draft: true`를 둔다.
- Java 또는 Spring 예시는 핵심 구조가 드러나는 최소 크기로 작성하고 실행형 샘플 프로젝트나 새 의존성은 추가하지 않는다.
- 강의 밖의 Java 동시성 또는 Spring 동작을 설명할 때는 Oracle JLS나 Spring 공식 문서로 검증한다.
- 모든 글 하단에는 해당 Inflearn 단위 링크와 연재 목록 링크를 두고, 존재하는 경우에만 이전·다음 글 링크를 둔다.
- 구현 중 사용자 소유의 기존 변경을 수정하거나 커밋하지 않는다.

---

## File Structure

### Create

- `tests/study-design-pattern-series.test.ts`: 연재 허브와 각 글의 frontmatter, 공통 절, 출처 링크 계약을 검증한다.
- `src/content/docs/study/design-patterns/index.md`: 8편의 목적과 읽는 순서를 제공하는 연재 허브다.
- `src/content/docs/study/design-patterns/introduction.md`: 디자인 패턴의 목적과 라이브러리·프레임워크 차이를 설명한다.
- `src/content/docs/study/design-patterns/singleton-basics.md`: 싱글톤의 동작, 사용 사례, 장단점을 설명한다.
- `src/content/docs/study/design-patterns/singleton-implementations.md`: 싱글톤 7가지 구현 방식을 비교한다.
- `src/content/docs/study/design-patterns/factory-and-iterator.md`: 팩토리와 이터레이터 패턴을 각각 설명하고 비교한다.
- `src/content/docs/study/design-patterns/dependency-injection-and-strategy.md`: DI, DIP, 전략 패턴과 컨텍스트를 구분한다.
- `src/content/docs/study/design-patterns/observer-and-proxy.md`: 옵저버와 프록시 패턴의 서로 다른 목적을 설명한다.
- `src/content/docs/study/design-patterns/mvc-mvp-mvvm.md`: MVC, MVP, MVVM과 Spring MVC 요청 흐름을 설명한다.
- `src/content/docs/study/design-patterns/flux-and-review.md`: Flux와 전체 디자인 패턴 면접 복습표를 제공한다.

### Modify

- `src/content/docs/study/index.md`: `소프트웨어 설계` 항목에서 디자인 패턴 연재 허브를 연결한다.
- `scripts/verify-build.mjs`: 허브와 8편의 정적 HTML 산출물을 검증한다.

### Content routes

- `/study/design-patterns/`
- `/study/design-patterns/introduction/`
- `/study/design-patterns/singleton-basics/`
- `/study/design-patterns/singleton-implementations/`
- `/study/design-patterns/factory-and-iterator/`
- `/study/design-patterns/dependency-injection-and-strategy/`
- `/study/design-patterns/observer-and-proxy/`
- `/study/design-patterns/mvc-mvp-mvvm/`
- `/study/design-patterns/flux-and-review/`

---

### Task 1: 연재 콘텐츠 계약과 허브 구축

**Files:**
- Create: `tests/study-design-pattern-series.test.ts`
- Create: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/index.md`

**Interfaces:**
- Consumes: 기존 `docsSchema`의 `contentType`, `series`, `topic`, `difficulty`, `sidebar.order` 필드
- Produces: 후속 글이 등록되는 `articles` 계약 배열과 `/study/design-patterns/` 허브

- [ ] **Step 1: 존재하지 않는 허브를 요구하는 계약 테스트 작성**

`tests/study-design-pattern-series.test.ts`를 다음 내용으로 생성한다.

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

type ArticleContract = {
  file: string;
  title: string;
  order: number;
  draft: boolean;
  unitIds: number[];
};

const studyRoot = new URL('../src/content/docs/study/', import.meta.url);
const articles: ArticleContract[] = [];

const readStudyFile = (path: string) => readFile(new URL(path, studyRoot), 'utf8');

describe('design pattern Study series', () => {
  it('links the series from the Study index', async () => {
    const studyIndex = await readStudyFile('index.md');
    expect(studyIndex).toContain(
      '[CS 지식의 정석 - 디자인 패턴](./design-patterns/)',
    );
  });

  it('defines the complete reading order in the series hub', async () => {
    const hub = await readStudyFile('design-patterns/index.md');

    expect(hub).toContain('title: CS 지식의 정석 - 디자인 패턴');
    const titles = [
      '디자인 패턴이란 무엇인가',
      '싱글톤 패턴의 원리와 장단점',
      '싱글톤 구현 방식 비교',
      '팩토리 패턴과 이터레이터 패턴',
      'DI·DIP와 전략 패턴',
      '옵저버 패턴과 프록시 패턴',
      'MVC·MVP·MVVM과 Spring MVC',
      'Flux 패턴과 디자인 패턴 총정리',
    ];
    for (const title of titles) {
      expect(hub).toContain(title);
    }
    const titlePositions = titles.map((title) => hub.indexOf(title));
    expect(titlePositions).toEqual([...titlePositions].sort((a, b) => a - b));
  });

  for (const article of articles) {
    it(`keeps the content contract for ${article.file}`, async () => {
      const markdown = await readStudyFile(`design-patterns/${article.file}`);

      expect(markdown).toContain(`title: ${article.title}`);
      expect(markdown).toContain('contentType: study');
      expect(markdown).toContain('series: CS 지식의 정석 - 디자인 패턴');
      expect(markdown).toContain('topic: Design Pattern');
      expect(markdown).toContain(`order: ${article.order}`);
      if (article.draft) {
        expect(markdown).toContain('draft: true');
      } else {
        expect(markdown).not.toContain('draft: true');
      }

      for (const heading of [
        '## 핵심 요약',
        '## 장점과 한계',
        '## 기술면접 질문',
        '## 복습 체크리스트',
        '## 참고 자료',
      ]) {
        expect(markdown).toContain(heading);
      }

      for (const unitId of article.unitIds) {
        expect(markdown).toContain(
          `https://www.inflearn.com/courses/lecture?courseId=328823&unitId=${unitId}`,
        );
      }
    });
  }
});
```

- [ ] **Step 2: 테스트를 실행해 허브 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `src/content/docs/study/design-patterns/index.md` or the missing Study index link.

- [ ] **Step 3: Study 인덱스에 소프트웨어 설계 항목 추가**

`src/content/docs/study/index.md`의 소개 문단 다음에 아래 내용을 추가한다.

```markdown
## 소프트웨어 설계

- [CS 지식의 정석 - 디자인 패턴](./design-patterns/)
```

- [ ] **Step 4: 연재 허브 생성**

`src/content/docs/study/design-patterns/index.md`를 아래 뼈대로 생성한다. 아직 작성하지 않은 항목은 깨진 링크를 만들지 않도록 일반 텍스트로 둔다.

```markdown
---
title: CS 지식의 정석 - 디자인 패턴
description: 디자인 패턴의 해결 문제와 선택 기준을 복습하고 기술면접 답변으로 연결합니다.
contentType: page
sidebar:
  order: 1
graph:
  visible: false
backlinks:
  visible: false
---

Inflearn `CS 지식의 정석` 섹션 2를 강의 순서에 따라 다시 정리합니다.
각 글은 핵심 개념, 장점과 한계, 기술면접 질문을 중심으로 다룹니다.

## 읽는 순서

1. 디자인 패턴이란 무엇인가
2. 싱글톤 패턴의 원리와 장단점
3. 싱글톤 구현 방식 비교
4. 팩토리 패턴과 이터레이터 패턴
5. DI·DIP와 전략 패턴
6. 옵저버 패턴과 프록시 패턴
7. MVC·MVP·MVVM과 Spring MVC
8. Flux 패턴과 디자인 패턴 총정리
```

- [ ] **Step 5: 콘텐츠 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS with 2 tests.

Run: `npm run check`

Expected: exit code 0 and no content schema errors.

- [ ] **Step 6: 허브 변경 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/index.md src/content/docs/study/design-patterns/index.md
git commit -m "docs: study 디자인 패턴 연재 허브 추가"
```

---

### Task 2: 첫 글 초안 작성과 사용자 문체 검토

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Create: `src/content/docs/study/design-patterns/introduction.md`

**Interfaces:**
- Consumes: Inflearn units `116050`, `162758`; Task 1의 콘텐츠 계약과 허브
- Produces: `draft: true` 상태의 `/study/design-patterns/introduction/` 초안과 이후 7편의 문체 기준

- [ ] **Step 1: 첫 글 계약을 추가해 실패 테스트 작성**

`articles` 배열을 다음 값으로 변경한다.

```ts
const articles: ArticleContract[] = [
  {
    file: 'introduction.md',
    title: '디자인 패턴이란 무엇인가',
    order: 1,
    draft: true,
    unitIds: [116050, 162758],
  },
];
```

- [ ] **Step 2: 테스트를 실행해 첫 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `design-patterns/introduction.md`.

- [ ] **Step 3: 강의 원문 근거 수집**

Inflearn connector로 아래 두 요청을 실행한다.

```text
get_lecture_content(courseId=328823, unitId=116050)
get_lecture_content(courseId=328823, unitId=162758)
```

강의에서 확인할 내용은 디자인 패턴의 목적, 생성·구조·행동 분류, 공통 언어의 가치, 라이브러리와 프레임워크의 규칙·자유도 차이다. 강의 자막 문장은 본문에 복사하지 않는다.

- [ ] **Step 4: 첫 글 작성**

아래 frontmatter와 절을 사용해 `introduction.md`를 작성한다.

```markdown
---
title: 디자인 패턴이란 무엇인가
description: 반복되는 설계 문제를 해결하는 디자인 패턴의 목적과 라이브러리·프레임워크의 차이를 정리합니다.
contentType: study
publishedAt: 2026-08-10
draft: true
tags: [Design Pattern, Architecture]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 1
---

## 핵심 요약
## 디자인 패턴이 해결하는 문제
## 패턴은 코드가 아니라 설계 언어다
## 생성·구조·행동 패턴
## 라이브러리와 프레임워크
## 언제 패턴을 적용할 것인가
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

`라이브러리와 프레임워크` 절에는 `호출 주체`, `구조 제약`, `교체 범위` 열을 가진 비교표를 둔다. 면접 질문은 `디자인 패턴을 사용하는 이유`, `라이브러리와 프레임워크의 차이`, `패턴을 항상 적용하면 안 되는 이유` 세 개를 작성한다. 하단 탐색은 연재 목록과 다음 글의 제목만 표시하고, 다음 글이 생기기 전에는 링크하지 않는다.

- [ ] **Step 5: 허브의 첫 항목을 실제 링크로 변경**

```markdown
1. [디자인 패턴이란 무엇인가](./introduction/)
```

- [ ] **Step 6: 초안 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS with 3 tests.

Run: `npm run check`

Expected: exit code 0 and no Markdown or frontmatter errors.

- [ ] **Step 7: 초안 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/introduction.md
git commit -m "docs: study 디자인 패턴 개요 초안 추가"
```

- [ ] **Step 8: 사용자 검토 체크포인트**

사용자에게 `introduction.md`의 문체, 깊이, 면접 답변 형식을 검토받는다. 승인 전에는 Task 3 이후를 실행하지 않는다.

---

### Task 3: 첫 글 공개

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/introduction.md`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: 사용자가 승인한 Task 2 초안
- Produces: 프로덕션 빌드에 포함되는 첫 글과 공개 산출물 검증

- [ ] **Step 1: 테스트 계약을 공개 상태로 변경**

`introduction.md` 계약의 `draft`를 `false`로 변경한다.

```ts
draft: false,
```

- [ ] **Step 2: 테스트를 실행해 아직 초안이라 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL because `introduction.md` still contains `draft: true`.

- [ ] **Step 3: 첫 글에서 초안 표시 제거**

`introduction.md` frontmatter의 `draft: true` 한 줄을 삭제한다. 하단에는 아래 탐색 링크를 둔다.

```markdown
[연재 목록](/study/design-patterns/) · 다음: 싱글톤 패턴의 원리와 장단점
```

- [ ] **Step 4: 공개 산출물 경로 추가**

`scripts/verify-build.mjs`의 `expectedFiles`에 다음 경로를 추가한다.

```js
'study/design-patterns/index.html',
'study/design-patterns/introduction/index.html',
```

- [ ] **Step 5: 첫 글 전체 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run verify`

Expected: Astro check, Vitest, production build, artifact verification all exit 0.

- [ ] **Step 6: 첫 글 공개 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/introduction.md scripts/verify-build.mjs
git commit -m "docs: study 디자인 패턴 개요 글 공개"
```

---

### Task 4: 싱글톤 기본 개념 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/introduction.md`
- Create: `src/content/docs/study/design-patterns/singleton-basics.md`

**Interfaces:**
- Consumes: Inflearn unit `116055`; 승인된 첫 글의 문체와 공통 절
- Produces: `/study/design-patterns/singleton-basics/`와 양방향 탐색 링크

- [ ] **Step 1: 싱글톤 기본 글 계약 추가**

`articles` 배열에 아래 항목을 추가한다.

```ts
{
  file: 'singleton-basics.md',
  title: '싱글톤 패턴의 원리와 장단점',
  order: 2,
  draft: false,
  unitIds: [116055],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `singleton-basics.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=116055)
```

인스턴스 하나를 공유하는 정의, 생성 비용이 큰 I/O 자원의 예, 모듈 간 의존성 증가, 단위 테스트 격리의 어려움을 근거로 사용한다.

- [ ] **Step 4: 싱글톤 기본 글 작성**

Frontmatter는 `tags: [Design Pattern, Singleton, Java]`, `sidebar.order: 2`를 사용한다. 본문은 다음 내용을 포함한다.

```markdown
## 핵심 요약
## 싱글톤이 해결하려는 문제
## 하나의 인스턴스를 보장하는 구조
## Java로 보는 최소 예시
## 어디에 사용할 수 있는가
## 장점과 한계
## Spring의 singleton scope와 같은가
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

Java 예시는 `private` 생성자, 정적 인스턴스, 정적 접근 메서드만 보여주고 동시성 해법은 다음 글로 넘긴다. Spring 절은 GoF 싱글톤이 클래스 로더 범위의 단일 인스턴스를 의도하는 반면 Spring singleton scope는 컨테이너와 bean 이름 범위임을 설명하고 [Spring Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)를 출처로 둔다.

면접 질문은 `싱글톤의 장점과 단점`, `싱글톤이 테스트를 어렵게 하는 이유`, `Spring singleton bean과 동일한 개념인지`를 다룬다.

- [ ] **Step 5: 허브와 이전·다음 탐색 연결**

허브 2번을 `[싱글톤 패턴의 원리와 장단점](./singleton-basics/)`로 바꾼다. `introduction.md`의 다음 글을 `/study/design-patterns/singleton-basics/` 링크로 바꾸고 새 글 하단에는 이전 글, 연재 목록, 다음 글 제목을 둔다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: 싱글톤 기본 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/introduction.md src/content/docs/study/design-patterns/singleton-basics.md
git commit -m "docs: study 싱글톤 패턴 기본 개념 정리"
```

---

### Task 5: 싱글톤 7가지 구현 방식 비교 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/singleton-basics.md`
- Create: `src/content/docs/study/design-patterns/singleton-implementations.md`

**Interfaces:**
- Consumes: Inflearn units `132521`, `132522`; Oracle JLS 17.4.5; Task 4의 싱글톤 기본 정의
- Produces: `/study/design-patterns/singleton-implementations/`와 7개 구현 비교표

- [ ] **Step 1: 싱글톤 구현 글 계약 추가**

```ts
{
  file: 'singleton-implementations.md',
  title: '싱글톤 구현 방식 비교',
  order: 3,
  draft: false,
  unitIds: [132521, 132522],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `singleton-implementations.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=132521)
get_lecture_content(courseId=328823, unitId=132522)
```

강의의 일곱 방식은 `단순 지연 생성`, `synchronized 접근자`, `정적 final 즉시 생성`, `정적 초기화 블록`, `Lazy Holder`, `volatile을 사용한 DCL`, `enum` 순서로 정리한다.

- [ ] **Step 4: 구현 비교 글 작성**

Frontmatter는 `tags: [Design Pattern, Singleton, Java, Concurrency]`, `sidebar.order: 3`을 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## 비교 기준
## 일곱 가지 구현 방식
## Lazy Holder 구현
## DCL에서 volatile이 필요한 이유
## enum 구현
## 어떤 방식을 선택할 것인가
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

`일곱 가지 구현 방식` 표는 `생성 시점`, `스레드 안전성`, `지연 초기화`, `주요 비용`을 비교한다. 전체 코드를 일곱 번 반복하지 않고 Lazy Holder와 enum은 완전한 최소 코드, DCL은 두 번의 null 확인과 `volatile`이 보이는 핵심 코드만 제시한다.

`volatile`을 CPU 캐시를 사용하지 않는 기능이라고 단정하지 않는다. 가시성과 happens-before 관계를 보장해 안전한 공개를 돕는다고 설명하고 [JLS 17.4.5](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.5)를 출처로 둔다.

면접 질문은 `가장 단순한 방식의 경쟁 조건`, `synchronized 접근자의 비용`, `DCL에 volatile이 필요한 이유`, `Lazy Holder와 enum 선택 기준`을 다룬다.

- [ ] **Step 5: 허브와 탐색 링크 연결**

허브 3번을 링크로 바꾸고, `singleton-basics.md`의 다음 링크와 새 글의 이전·목록·다음 제목을 연결한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: 싱글톤 구현 비교 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/singleton-basics.md src/content/docs/study/design-patterns/singleton-implementations.md
git commit -m "docs: study 싱글톤 구현 방식 비교 정리"
```

---

### Task 6: 팩토리와 이터레이터 패턴 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/singleton-implementations.md`
- Create: `src/content/docs/study/design-patterns/factory-and-iterator.md`

**Interfaces:**
- Consumes: Inflearn units `118502`, `118503`
- Produces: `/study/design-patterns/factory-and-iterator/`와 두 패턴의 독립 설명 및 비교표

- [ ] **Step 1: 팩토리·이터레이터 글 계약 추가**

```ts
{
  file: 'factory-and-iterator.md',
  title: '팩토리 패턴과 이터레이터 패턴',
  order: 4,
  draft: false,
  unitIds: [118502, 118503],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `factory-and-iterator.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=118502)
get_lecture_content(courseId=328823, unitId=118503)
```

- [ ] **Step 4: 두 패턴을 독립된 절로 작성**

Frontmatter는 `tags: [Design Pattern, Factory, Iterator]`, `sidebar.order: 4`를 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## 팩토리 패턴이 해결하는 문제
## 팩토리 패턴의 구조와 예시
## 이터레이터 패턴이 해결하는 문제
## 이터레이터 패턴의 구조와 예시
## 두 패턴의 차이
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

팩토리 예시는 `Notification` 인터페이스와 `EmailNotification`, `SmsNotification` 생성 결정을 팩토리에 위임한다. 이터레이터 예시는 `Iterable<Order>`가 내부 컬렉션을 노출하지 않고 순회를 제공하는 구조를 사용한다. 비교표는 `목적`, `숨기는 변화`, `주요 참여자` 열로 구성하며 두 패턴을 같은 종류라고 설명하지 않는다.

면접 질문은 `객체 생성을 분리하면 얻는 이점`, `팩토리와 생성자 직접 호출의 선택 기준`, `이터레이터가 컬렉션 내부 구조를 감추는 방법`을 다룬다.

- [ ] **Step 5: 허브와 탐색 링크 연결**

허브 4번을 링크로 바꾸고 이전 글과 새 글의 탐색 링크를 연결한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: 팩토리·이터레이터 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/singleton-implementations.md src/content/docs/study/design-patterns/factory-and-iterator.md
git commit -m "docs: study 팩토리와 이터레이터 패턴 정리"
```

---

### Task 7: DI·DIP와 전략 패턴 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/factory-and-iterator.md`
- Create: `src/content/docs/study/design-patterns/dependency-injection-and-strategy.md`

**Interfaces:**
- Consumes: Inflearn units `118490`, `118504`, `120148`, `120149`
- Produces: `/study/design-patterns/dependency-injection-and-strategy/`와 DI·DIP·전략 비교표

- [ ] **Step 1: DI·전략 글 계약 추가**

```ts
{
  file: 'dependency-injection-and-strategy.md',
  title: 'DI·DIP와 전략 패턴',
  order: 5,
  draft: false,
  unitIds: [118490, 118504, 120148, 120149],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `dependency-injection-and-strategy.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=118490)
get_lecture_content(courseId=328823, unitId=118504)
get_lecture_content(courseId=328823, unitId=120148)
get_lecture_content(courseId=328823, unitId=120149)
```

- [ ] **Step 4: DI·DIP·전략 관계 글 작성**

Frontmatter는 `tags: [Design Pattern, Dependency Injection, Strategy, Spring]`, `sidebar.order: 5`를 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## 직접 의존이 만드는 문제
## DIP는 원칙이고 DI는 구현 방법이다
## 전략 패턴과 컨텍스트
## 전략 패턴과 DI의 차이
## Spring 생성자 주입 예시
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

예시는 `PaymentStrategy` 계약, `CardPaymentStrategy` 구현, 생성자로 전략을 받는 `CheckoutService` 컨텍스트를 사용한다. 비교표는 `분류`, `주목적`, `교체 대상`, `사용 시점`으로 DI, DIP, 전략 패턴을 구분한다. 컨텍스트는 전략을 사용해 작업을 수행하는 객체라는 의미를 먼저 설명하고, 운영체제나 프론트엔드에서는 문맥에 따라 다른 의미가 된다는 짧은 주의문을 둔다.

면접 질문은 `DI와 DIP의 차이`, `전략 패턴과 DI의 공통점과 차이`, `생성자 주입이 테스트에 주는 이점`, `컨텍스트의 의미`를 다룬다.

- [ ] **Step 5: 허브와 탐색 링크 연결**

허브 5번을 링크로 바꾸고 이전 글과 새 글의 탐색 링크를 연결한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: DI·DIP·전략 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/factory-and-iterator.md src/content/docs/study/design-patterns/dependency-injection-and-strategy.md
git commit -m "docs: study DI DIP 전략 패턴 정리"
```

---

### Task 8: 옵저버와 프록시 패턴 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/dependency-injection-and-strategy.md`
- Create: `src/content/docs/study/design-patterns/observer-and-proxy.md`

**Interfaces:**
- Consumes: Inflearn units `116058`, `116059`; Spring AOP proxy 공식 문서
- Produces: `/study/design-patterns/observer-and-proxy/`와 객체 프록시·네트워크 프록시 구분

- [ ] **Step 1: 옵저버·프록시 글 계약 추가**

```ts
{
  file: 'observer-and-proxy.md',
  title: '옵저버 패턴과 프록시 패턴',
  order: 6,
  draft: false,
  unitIds: [116058, 116059],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `observer-and-proxy.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=116058)
get_lecture_content(courseId=328823, unitId=116059)
```

- [ ] **Step 4: 두 패턴의 목적을 분리해 작성**

Frontmatter는 `tags: [Design Pattern, Observer, Proxy, Spring]`, `sidebar.order: 6`을 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## 옵저버 패턴이 해결하는 문제
## Subject와 Observer의 흐름
## 프록시 패턴이 해결하는 문제
## 객체 프록시와 프록시 서버
## Spring AOP에서의 프록시
## 두 패턴의 차이
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

옵저버 예시는 주문 상태 변경을 여러 알림 구독자에게 전달하는 구조를, 프록시 예시는 같은 `PaymentClient` 계약을 구현하며 실제 클라이언트 호출 전 로깅·접근 제어를 수행하는 구조를 사용한다. HTTP→HTTPS 전환과 DDoS 방어는 네트워크 프록시 사례로 분리해 객체 프록시와 동일한 구현이라고 오해하지 않게 한다. Spring AOP 설명은 [Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)를 출처로 둔다.

면접 질문은 `옵저버의 느슨한 결합과 해제 누락 문제`, `프록시의 목적`, `프록시와 데코레이터의 차이`, `Spring AOP가 프록시를 사용하는 이유`를 다룬다.

- [ ] **Step 5: 허브와 탐색 링크 연결**

허브 6번을 링크로 바꾸고 이전 글과 새 글의 탐색 링크를 연결한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: 옵저버·프록시 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/dependency-injection-and-strategy.md src/content/docs/study/design-patterns/observer-and-proxy.md
git commit -m "docs: study 옵저버와 프록시 패턴 정리"
```

---

### Task 9: MVC·MVP·MVVM과 Spring MVC 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/observer-and-proxy.md`
- Create: `src/content/docs/study/design-patterns/mvc-mvp-mvvm.md`

**Interfaces:**
- Consumes: Inflearn units `116060`, `139952`; Spring MVC DispatcherServlet 공식 문서
- Produces: `/study/design-patterns/mvc-mvp-mvvm/`와 Spring MVC 요청 흐름

- [ ] **Step 1: MVC 계열 글 계약 추가**

```ts
{
  file: 'mvc-mvp-mvvm.md',
  title: 'MVC·MVP·MVVM과 Spring MVC',
  order: 7,
  draft: false,
  unitIds: [116060, 139952],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `mvc-mvp-mvvm.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=116060)
get_lecture_content(courseId=328823, unitId=139952)
```

- [ ] **Step 4: UI 아키텍처와 Spring 요청 흐름 작성**

Frontmatter는 `tags: [Design Pattern, MVC, MVVM, Spring MVC]`, `sidebar.order: 7`을 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## 표현 로직을 분리해야 하는 이유
## MVC의 책임과 흐름
## MVP와 MVVM은 무엇이 다른가
## MVC·MVP·MVVM 비교
## Spring MVC 요청 처리 흐름
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

비교표는 `중간 역할`, `View와의 관계`, `상태 동기화`, `대표적인 부담`을 기준으로 한다. Spring 흐름은 `요청 → DispatcherServlet → HandlerMapping → Controller → ModelAndView 또는 응답 본문` 순서로 설명하고 View Resolver가 필요한 전통적 MVC 렌더링과 REST 응답을 구분한다. [Spring MVC DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)을 보충 출처로 둔다.

면접 질문은 `MVC의 책임 분리`, `MVP와 MVVM의 차이`, `DispatcherServlet의 역할`, `MVC의 양방향 의존이 복잡해지는 경우`를 다룬다.

- [ ] **Step 5: 허브와 탐색 링크 연결**

허브 7번을 링크로 바꾸고 이전 글과 새 글의 탐색 링크를 연결한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: MVC 계열 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/observer-and-proxy.md src/content/docs/study/design-patterns/mvc-mvp-mvvm.md
git commit -m "docs: study MVC MVP MVVM 패턴 정리"
```

---

### Task 10: Flux와 전체 면접 복습 글 작성

**Files:**
- Modify: `tests/study-design-pattern-series.test.ts`
- Modify: `src/content/docs/study/design-patterns/index.md`
- Modify: `src/content/docs/study/design-patterns/mvc-mvp-mvvm.md`
- Create: `src/content/docs/study/design-patterns/flux-and-review.md`

**Interfaces:**
- Consumes: Inflearn unit `118705`; 앞선 7편의 핵심 요약과 면접 질문
- Produces: `/study/design-patterns/flux-and-review/`와 완성된 연재 탐색 체인

- [ ] **Step 1: Flux·총정리 글 계약 추가**

```ts
{
  file: 'flux-and-review.md',
  title: 'Flux 패턴과 디자인 패턴 총정리',
  order: 8,
  draft: false,
  unitIds: [118705],
},
```

- [ ] **Step 2: 테스트를 실행해 새 글 부재로 실패하는지 확인**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: FAIL with `ENOENT` for `flux-and-review.md`.

- [ ] **Step 3: 강의 근거 수집**

```text
get_lecture_content(courseId=328823, unitId=118705)
```

- [ ] **Step 4: Flux와 전체 복습 글 작성**

Frontmatter는 `tags: [Design Pattern, Flux, Architecture, Interview]`, `sidebar.order: 8`을 사용한다. 본문은 다음 절을 포함한다.

```markdown
## 핵심 요약
## MVC의 복잡성이 드러나는 지점
## Flux의 네 가지 구성 요소
## 단방향 데이터 흐름
## MVC와 Flux 비교
## 패턴별 해결 문제 총정리
## 장점과 한계
## 기술면접 질문
## 복습 체크리스트
## 참고 자료
```

Flux 흐름은 `Action → Dispatcher → Store → View → Action`으로 표현한다. MVC와 Flux 비교표는 `데이터 흐름`, `상태 변경 위치`, `추적 용이성`, `초기 복잡도`를 사용한다. 전체 복습표는 싱글톤, 팩토리, 이터레이터, 전략, 옵저버, 프록시, MVC 계열, Flux에 대해 `해결 문제`, `핵심 아이디어`, `주의점`만 한 줄씩 제공한다.

면접 질문은 `Flux가 등장한 이유`, `단방향 흐름의 장단점`, `MVC와 Flux 선택 기준`, `요구사항에 맞는 패턴을 선택하는 방법`을 다룬다.

- [ ] **Step 5: 허브와 마지막 탐색 링크 완성**

허브 8번을 `[Flux 패턴과 디자인 패턴 총정리](./flux-and-review/)`로 바꾼다. `mvc-mvp-mvvm.md`의 다음 링크를 새 글로 연결하고 새 글 하단에는 이전 글과 연재 목록만 둔다. 허브의 8개 항목이 모두 링크인지 확인한다.

- [ ] **Step 6: 계약과 스키마 검증**

Run: `npm test -- tests/study-design-pattern-series.test.ts`

Expected: PASS with 10 tests: Study 링크 1개, 허브 1개, 글 계약 8개.

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 7: Flux·총정리 글 커밋**

```bash
git add tests/study-design-pattern-series.test.ts src/content/docs/study/design-patterns/index.md src/content/docs/study/design-patterns/mvc-mvp-mvvm.md src/content/docs/study/design-patterns/flux-and-review.md
git commit -m "docs: study Flux 패턴과 면접 복습 정리"
```

---

### Task 11: 전체 연재 산출물과 화면 검증

**Files:**
- Modify: `scripts/verify-build.mjs`
- Verify: `src/content/docs/study/design-patterns/index.md`
- Verify: `src/content/docs/study/design-patterns/*.md`

**Interfaces:**
- Consumes: 공개 상태인 허브와 본문 8편
- Produces: 프로덕션 산출물 계약과 데스크톱·모바일 QA 증거

- [ ] **Step 1: 아직 검증되지 않는 나머지 7개 산출물 경로를 추가**

`scripts/verify-build.mjs`의 `expectedFiles`에 다음 경로를 추가한다.

```js
'study/design-patterns/singleton-basics/index.html',
'study/design-patterns/singleton-implementations/index.html',
'study/design-patterns/factory-and-iterator/index.html',
'study/design-patterns/dependency-injection-and-strategy/index.html',
'study/design-patterns/observer-and-proxy/index.html',
'study/design-patterns/mvc-mvp-mvvm/index.html',
'study/design-patterns/flux-and-review/index.html',
```

- [ ] **Step 2: 빌드 산출물의 연재 제목 검증 추가**

`scripts/verify-build.mjs`에 아래 검증을 추가한다.

```js
const designPatternHub = await readFile(
  new URL('study/design-patterns/index.html', distUrl),
  'utf8',
);
for (const requiredText of [
  '디자인 패턴이란 무엇인가',
  '싱글톤 패턴의 원리와 장단점',
  '싱글톤 구현 방식 비교',
  '팩토리 패턴과 이터레이터 패턴',
  'DI·DIP와 전략 패턴',
  '옵저버 패턴과 프록시 패턴',
  'MVC·MVP·MVVM과 Spring MVC',
  'Flux 패턴과 디자인 패턴 총정리',
]) {
  if (!designPatternHub.includes(requiredText)) {
    throw new Error(`design pattern hub is missing: ${requiredText}`);
  }
}
```

- [ ] **Step 3: 전체 자동 검증 실행**

Run: `npm run verify`

Expected:

- Astro check exits 0.
- Vitest reports all tests passing, including 10 design-pattern series tests.
- Astro production build exits 0 with no broken internal links.
- `verify-build.mjs` confirms all nine design-pattern HTML files.

- [ ] **Step 4: 로컬 미리보기 실행**

Run: `npm run dev -- --host 127.0.0.1`

브라우저에서 아래 경로를 확인한다.

```text
http://127.0.0.1:4321/study/
http://127.0.0.1:4321/study/design-patterns/
http://127.0.0.1:4321/study/design-patterns/introduction/
http://127.0.0.1:4321/study/design-patterns/singleton-implementations/
http://127.0.0.1:4321/study/design-patterns/mvc-mvp-mvvm/
http://127.0.0.1:4321/study/design-patterns/flux-and-review/
```

데스크톱 1440px와 모바일 390px에서 다음을 확인한다.

- Study에서 연재 허브로 이동할 수 있다.
- 허브의 8개 링크가 올바른 순서로 표시된다.
- 표와 Java 코드 블록은 페이지 폭을 깨지 않고 가로 스크롤된다.
- 이전·목록·다음 링크가 올바른 글로 이동한다.
- 제목은 페이지당 하나의 H1만 렌더링한다.

- [ ] **Step 5: 빌드 검증 커밋**

```bash
git add scripts/verify-build.mjs
git commit -m "test: study 디자인 패턴 연재 산출물 검증 추가"
```

- [ ] **Step 6: 최종 상태 확인**

Run: `git status --short --branch`

Expected: 작업 트리가 깨끗하고 현재 브랜치에 계획된 연재 커밋만 추가되어 있다.
