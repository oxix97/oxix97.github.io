# 네트워크 기초 Study 연재 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inflearn `CS 지식의 정석` 네트워크 섹션의 40~45강을 개인 언어로 정리한 Study 허브와 글 3편을 게시한다.

**Architecture:** `src/content/docs/study/network/`에 독립 연재 디렉터리를 만들고, Starlight 자동 사이드바에 표시되는 허브와 3개 Markdown 문서를 연결한다. 전용 Vitest 계약은 허브 링크·frontmatter·필수 절·Inflearn 출처·이전/다음 탐색을 검증하고, 빌드 검증은 생성된 정적 경로와 허브의 링크 순서를 확인한다.

**Tech Stack:** Astro 5.18, Starlight 0.35, Markdown, TypeScript, Vitest 3.2, Inflearn connector

## Global Constraints

- 모든 본문은 한국어로 작성하고, 강의 자막이나 교안을 연속 인용하지 않는다.
- 모든 글은 `contentType: study`, `publishedAt: 2026-08-10`, `series: CS 지식의 정석 - 네트워크`, `topic: Network`, `difficulty: intermediate`를 사용한다.
- 모든 글은 `핵심 요약`, `기술면접 질문`, `복습 체크리스트`, `참고 자료` 절을 포함한다.
- 기술면접 질문은 글당 2~4개이며 답변은 결론, 근거, 사례 또는 한계의 정확히 세 문장으로 작성한다.
- 네트워크 지연은 애플리케이션 처리 시간과 분리해서 판단하며, Kafka 소비자 그룹의 분배를 IP 멀티캐스트로 설명하지 않는다.
- 각 글 하단에는 연재 목록과 존재하는 이전·다음 글을 절대 경로로 연결한다.
- 실제 프로젝트 인프라나 성능 수치를 주장하지 않고, 일반화된 백엔드 요청 경로만 예시로 든다.
- 구현 중 사용자 소유의 기존 변경을 수정하거나 커밋하지 않는다.

---

## File Structure

### Create

- `tests/study-network-series.test.ts`: 네트워크 연재의 콘텐츠 계약을 검증한다.
- `src/content/docs/study/network/index.md`: 연재 목적과 3편의 읽는 순서를 제공한다.
- `src/content/docs/study/network/network-performance-metrics.md`: 트래픽·대역폭·처리량·RTT를 설명한다.
- `src/content/docs/study/network/topology-and-bottlenecks.md`: 토폴로지와 병목 분석 순서를 설명한다.
- `src/content/docs/study/network/network-classification.md`: 전달 대상과 통신 범위 분류를 설명한다.

### Modify

- `src/content/docs/study/index.md`: 새 네트워크 연재 허브를 연결한다.
- `scripts/verify-build.mjs`: 3개 정적 글 경로와 허브의 정확한 링크 순서를 검증한다.

### Content routes

- `/study/network/`
- `/study/network/network-performance-metrics/`
- `/study/network/topology-and-bottlenecks/`
- `/study/network/network-classification/`

---

### Task 1: 네트워크 연재 계약을 RED 상태로 추가한다

**Files:**
- Create: `tests/study-network-series.test.ts`

**Interfaces:**
- Consumes: `src/content/docs/study/`의 Markdown 파일과 기존 Vitest 환경
- Produces: `articles`, `courseUrl`, `expectedNavigation`을 통해 이후 모든 문서를 검증하는 콘텐츠 계약

- [ ] **Step 1: 없는 연재 허브와 글을 요구하는 테스트를 작성한다.**

`tests/study-network-series.test.ts`를 작성한다. `articles`는 아래 계약을 사용한다.

```ts
const articles = [
  {
    file: 'network-performance-metrics.md',
    title: '대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이',
    order: 1,
    tags: ['Network', 'Performance', 'RTT', 'Backend'],
    units: [
      { title: '네트워크의 기초 #1. 네트워크, 처리량, 트래픽, 대역폭, RTT ★★★', unitId: 121330 },
    ],
  },
  {
    file: 'topology-and-bottlenecks.md',
    title: '연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석',
    order: 2,
    tags: ['Network', 'Topology', 'Bottleneck', 'Backend'],
    units: [
      { title: '네트워크의 기초 #2. 네트워크 토폴로지 : 버스, 스타, 트리 ★★★', unitId: 121331 },
      { title: '네트워크의 기초 #3. 네트워크 토폴로지 : 링, 메시 ★★★', unitId: 121332 },
      { title: '네트워크의 기초 #4.  병목현상과 네트워크 토폴로지의 필요성 ★★★', unitId: 130662 },
    ],
  },
  {
    file: 'network-classification.md',
    title: '유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준',
    order: 3,
    tags: ['Network', 'Unicast', 'LAN', 'Backend'],
    units: [
      { title: '네트워크의 기초 #5. 유니캐스트, 멀티캐스트, 브로드캐스트 ★★★', unitId: 164725 },
      { title: '네트워크의 분류 : LAN, MAN, WAN ★☆☆', unitId: 130855 },
    ],
  },
];
```

테스트는 `src/content/docs/study/index.md`의 `[CS 지식의 정석 - 네트워크](./network/)` 링크, 허브의 정확한 순서 링크, 글의 frontmatter, 필수 절, Inflearn 링크, 첫·중간·마지막 글의 정확한 탐색 문구를 검증한다. 디자인 패턴 계약 테스트의 `parseFrontmatter`, `extractSection`, `extractInterviewAnswers`, `splitSentences`를 복사해 각 면접 답변이 정확히 세 문장인지 확인한다.

- [ ] **Step 2: 테스트가 콘텐츠 부재로 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `ENOENT` 또는 Study 인덱스에 네트워크 연재 링크가 없다는 assertion failure.

- [ ] **Step 3: 실패 원인이 새 기능 부재인지 확인하고 커밋하지 않는다.**

테스트 실패가 import, TypeScript 문법, 기존 테스트 실패가 아니라 `network/index.md` 또는 대상 글이 아직 없기 때문인지 확인한다. 이 Task의 산출물은 테스트 파일뿐이므로 다음 Task에서 콘텐츠와 함께 커밋한다.

---

### Task 2: Study 인덱스와 연재 허브를 추가한다

**Files:**
- Modify: `src/content/docs/study/index.md`
- Create: `src/content/docs/study/network/index.md`
- Modify: `tests/study-network-series.test.ts`

**Interfaces:**
- Consumes: Task 1의 `articles` 순서와 URL 규칙
- Produces: `/study/network/` 허브와 3개 글이 연결될 수 있는 읽기 순서

- [ ] **Step 1: 글을 링크하는 허브 계약으로 테스트를 확장한다.**

읽기 순서에서 각 항목이 일반 텍스트가 아니라 아래 형식의 실제 상대 링크여야 한다고 검증한다.

```ts
expect(links).toEqual(
  articles.map(({ file, title }) => ({
    title,
    href: `./${file.replace(/\.md$/, '/')}`,
  })),
);
```

- [ ] **Step 2: 링크한 글이 아직 없어서 테스트가 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: 허브 또는 글 파일이 없어서 FAIL.

- [ ] **Step 3: Study 인덱스에 연재 링크를 추가한다.**

`## 네트워크와 웹` 아래에 아래 항목을 `HTTP Cache-Control 정리` 앞에 추가한다.

```markdown
- [CS 지식의 정석 - 네트워크](./network/)
```

- [ ] **Step 4: 연재 허브를 작성한다.**

`src/content/docs/study/network/index.md`에 아래 frontmatter와 읽기 순서를 작성한다.

```markdown
---
title: CS 지식의 정석 - 네트워크
description: 네트워크 성능, 연결 구조, 분류 기준을 백엔드 관점에서 복습하고 기술면접 답변으로 연결합니다.
contentType: page
sidebar:
  order: 1
graph:
  visible: false
backlinks:
  visible: false
---

Inflearn `CS 지식의 정석` 네트워크 섹션을 강의 순서에 따라 다시 정리합니다.
각 글은 개념의 차이, 장애·성능 판단 기준, 기술면접 질문을 중심으로 다룹니다.

## 읽는 순서

1. [대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이](./network-performance-metrics/)
2. [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](./topology-and-bottlenecks/)
3. [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](./network-classification/)
```

- [ ] **Step 5: 계약 테스트와 Starlight 검증을 실행한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: 세 글이 아직 없어서 FAIL.

Run: `npm run check`

Expected: exit code 0; 허브와 Study 인덱스의 frontmatter 오류 없음.

---

### Task 3: 성능 지표 글을 작성한다

**Files:**
- Create: `src/content/docs/study/network/network-performance-metrics.md`
- Modify: `tests/study-network-series.test.ts`

**Interfaces:**
- Consumes: Inflearn 단원 `121330`, Task 1의 첫 글 계약
- Produces: `/study/network/network-performance-metrics/`와 첫 글 탐색 링크

- [ ] **Step 1: 첫 글의 필수 구획을 요구하는 테스트를 추가한다.**

첫 글에서 아래 구획을 추출할 수 있도록 검증한다.

```ts
for (const heading of [
  '핵심 요약',
  '트래픽과 처리량의 차이',
  '대역폭과 실제 처리량이 다른 이유',
  'RTT가 API 응답 시간에 미치는 영향',
  '기술면접 질문',
  '복습 체크리스트',
  '참고 자료',
]) {
  expect(() => extractSection(markdown, heading)).not.toThrow();
}
```

- [ ] **Step 2: 글이 아직 없어 테스트가 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `ENOENT` for `network-performance-metrics.md`.

- [ ] **Step 3: 강의 근거를 확인한다.**

Inflearn connector로 `get_lecture_content(courseId=328823, unitId=121330)`을 호출한다. 용어 정의를 이해하는 데만 사용하고 원문을 연속 인용하지 않는다.

- [ ] **Step 4: 첫 글을 작성한다.**

frontmatter는 아래와 같이 사용한다.

```markdown
---
title: 대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이
description: 트래픽, 대역폭, 처리량, RTT를 구분하고 API 지연을 네트워크와 애플리케이션 시간으로 나누어 판단하는 방법을 정리합니다.
contentType: study
publishedAt: 2026-08-10
tags: [Network, Performance, RTT, Backend]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 1
---
```

트래픽·대역폭·처리량·RTT의 의미와 확인 질문을 표로 비교한다. API 응답 시간 증가 시 데이터 크기, 대역폭 대비 실제 처리량, 서버 간 RTT, 애플리케이션 처리 시간을 순서로 확인하는 텍스트 흐름을 포함한다. 면접 질문은 `대역폭과 처리량의 차이`, `RTT가 API 응답 시간에 주는 영향`, `네트워크 병목과 애플리케이션 지연을 구분하는 방법` 세 개로 작성한다.

참고 자료에는 단원 제목과 URL `https://www.inflearn.com/courses/lecture?courseId=328823&unitId=121330`을 포함한다. 마지막 줄은 아래와 같다.

```markdown
[연재 목록](/study/network/) · 다음: [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](/study/network/topology-and-bottlenecks/)
```

- [ ] **Step 5: 첫 글 계약을 GREEN으로 만든다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: 첫 글의 계약은 PASS; 나머지 두 글 부재로 전체는 FAIL.

---

### Task 4: 토폴로지와 병목 분석 글을 작성한다

**Files:**
- Create: `src/content/docs/study/network/topology-and-bottlenecks.md`
- Modify: `tests/study-network-series.test.ts`

**Interfaces:**
- Consumes: Inflearn 단원 `121331`, `121332`, `130662`, Task 1의 두 번째 글 계약
- Produces: `/study/network/topology-and-bottlenecks/`와 양방향 탐색 링크

- [ ] **Step 1: 두 번째 글의 토폴로지·병목 절을 요구하는 테스트를 추가한다.**

`버스형·스타형·트리형 토폴로지`, `링형·메시형 토폴로지`, `연결 구조에서 병목이 발생하는 지점`, `백엔드 시스템에서 병목을 찾는 순서`를 필수 절로 추가한다.

- [ ] **Step 2: 대상 파일 부재로 RED를 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `ENOENT` for `topology-and-bottlenecks.md`.

- [ ] **Step 3: 세 강의의 근거를 확인한다.**

Inflearn connector로 단원 `121331`, `121332`, `130662`의 콘텐츠를 각각 조회한다.

- [ ] **Step 4: 두 번째 글을 작성한다.**

`tags: [Network, Topology, Bottleneck, Backend]`, `sidebar.order: 2`를 사용한다. 버스·스타·트리·링·메시형을 `구조적 특징`, `장점`, `주요 위험` 열로 비교한다. API Gateway, Kafka, PostgreSQL을 요청이 집중될 수 있는 예시로만 사용하고, 특정 제품이 반드시 병목이라는 주장은 하지 않는다.

병목 분석 절에는 다음 순서를 번호 목록으로 작성한다.

```markdown
1. 요청이 이동하는 전체 경로를 그린다.
2. 각 구간의 처리량, 지연시간, 오류율을 측정한다.
3. 여러 요청이 집중되는 공통 노드를 찾는다.
4. 해당 노드의 CPU, 메모리, 연결 수, 큐 적체를 확인한다.
5. 수직 확장, 수평 확장, 캐시, 비동기 처리, 경로 분산을 비교한다.
```

면접 질문은 `스타형 토폴로지의 장점과 단점`, `메시형 토폴로지가 장애 대응에 유리한 이유`, `백엔드 시스템에서 병목을 찾는 순서` 세 개로 작성한다. 참고 자료에는 세 단원 링크를 모두 둔다. 마지막 줄은 아래와 같다.

```markdown
이전: [대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이](/study/network/network-performance-metrics/) · [연재 목록](/study/network/) · 다음: [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](/study/network/network-classification/)
```

- [ ] **Step 5: 두 번째 글 계약을 GREEN으로 만든다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: 첫·두 번째 글 계약은 PASS; 마지막 글 부재로 전체는 FAIL.

---

### Task 5: 전달 대상과 통신 범위 분류 글을 작성한다

**Files:**
- Create: `src/content/docs/study/network/network-classification.md`
- Modify: `tests/study-network-series.test.ts`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: Inflearn 단원 `164725`, `130855`, Task 1의 세 번째 글 계약
- Produces: 완성된 연재와 정적 사이트 검증 대상 4개 경로

- [ ] **Step 1: 마지막 글의 독립 분류 기준을 요구하는 테스트를 추가한다.**

`전달 대상에 따른 분류`, `유니캐스트·멀티캐스트·브로드캐스트 비교`, `통신 범위에 따른 분류`, `LAN·MAN·WAN 비교`, `백엔드 통신은 어떤 방식에 해당하는가` 절을 추가로 검증한다. `백엔드 통신은 어떤 방식에 해당하는가` 절에는 `IP 멀티캐스트`와 `Kafka`가 모두 등장하고, `같지 않` 문구가 포함되는지 검증한다.

- [ ] **Step 2: 대상 파일 부재로 RED를 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `ENOENT` for `network-classification.md`.

- [ ] **Step 3: 두 강의의 근거를 확인한다.**

Inflearn connector로 단원 `164725`, `130855`의 콘텐츠를 각각 조회한다.

- [ ] **Step 4: 마지막 글을 작성한다.**

`tags: [Network, Unicast, LAN, Backend]`, `sidebar.order: 3`을 사용한다. 유니캐스트·멀티캐스트·브로드캐스트는 전달 대상, LAN·MAN·WAN은 통신 범위임을 핵심 요약에서 먼저 분리한다. REST API와 gRPC는 일반적인 일대일 요청·응답이므로 유니캐스트 관점으로 설명하고, Kafka의 소비자 그룹 분배는 브로커 기반 애플리케이션 계층 동작이므로 IP 멀티캐스트와 같지 않다고 명시한다.

면접 질문은 `유니캐스트와 브로드캐스트의 차이`, `멀티캐스트와 Kafka 소비자 그룹의 차이`, `LAN·MAN·WAN이 구분하는 기준` 세 개로 작성한다. 참고 자료에 두 단원 링크를 둔다. 마지막 줄은 아래와 같다.

```markdown
이전: [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](/study/network/topology-and-bottlenecks/) · [연재 목록](/study/network/)
```

- [ ] **Step 5: 정적 산출물 검증을 확장한다.**

`scripts/verify-build.mjs`의 `expectedFiles`에 아래 네 경로를 추가한다.

```js
'study/network/index.html',
'study/network/network-performance-metrics/index.html',
'study/network/topology-and-bottlenecks/index.html',
'study/network/network-classification/index.html',
```

디자인 패턴 허브 검증과 같은 방식으로 네트워크 허브의 `<main>` 안 링크가 아래 순서인지 검증한다.

```js
[
  { href: './network-performance-metrics/', title: '대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이' },
  { href: './topology-and-bottlenecks/', title: '연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석' },
  { href: './network-classification/', title: '유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준' },
]
```

- [ ] **Step 6: 전용 계약 테스트를 GREEN으로 만든다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: PASS; 3개 글, 허브, 강의 링크, 면접 답변, 탐색 링크가 모두 검증됨.

- [ ] **Step 7: 콘텐츠와 검증 변경을 커밋한다.**

```bash
git add tests/study-network-series.test.ts src/content/docs/study/index.md src/content/docs/study/network scripts/verify-build.mjs
git commit -m "docs: study 네트워크 기초 연재 추가"
```

---

### Task 6: 전체 사이트를 검증한다

**Files:**
- Verify only: `tests/study-network-series.test.ts`, `src/content/docs/study/network/`, `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: Tasks 1~5의 완성된 연재와 빌드 산출물 계약
- Produces: 검증된 정적 사이트

- [ ] **Step 1: 전체 테스트를 실행한다.**

Run: `npm test`

Expected: exit code 0; 기존 테스트와 `study-network-series.test.ts`를 포함한 모든 Vitest 테스트가 PASS.

- [ ] **Step 2: 콘텐츠 스키마를 검증한다.**

Run: `npm run check`

Expected: exit code 0; 모든 Markdown frontmatter가 Starlight 스키마를 통과.

- [ ] **Step 3: 정적 빌드와 산출물을 검증한다.**

Run: `npm run build && npm run verify:build`

Expected: exit code 0; 네트워크 허브와 3개 글의 HTML이 생성되고 허브 링크 순서가 일치.

- [ ] **Step 4: 최종 변경 범위를 확인한다.**

Run: `git status --short && git diff --check HEAD`

Expected: 공백 오류 없음; 요청 범위의 네트워크 콘텐츠와 검증 파일만 표시됨.
