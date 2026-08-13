# 라우팅과 라우팅 테이블 학습 글 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inflearn 라우팅 강의 2편을 기술적으로 검증한 네트워크 연재 7편으로 작성하고 기존 연재 탐색 경로에 연결한다.

**Architecture:** 새 Markdown 글 하나가 라우팅의 판단 흐름, 라우팅 테이블 필드, 가장 긴 프리픽스 일치와 기본 경로를 설명한다. 네트워크 인덱스와 직전 글은 새 글로 이어지는 탐색 링크만 담당하며, 기존 본문과 다이어그램은 건드리지 않는다.

**Tech Stack:** Astro 7, Starlight, Markdown, pnpm, RFC 문서, Linux `ip-route(8)` 문서

## Global Constraints

- 개인 경험을 만들지 않고 중립적인 복습 동기로 시작한다.
- 본문은 편안한 `-다`, 기술면접 답변은 `-습니다`로 쓴다.
- `핵심 요약 → 원리 → 표·명령 예시 → 장점과 한계 → 기술면접 질문 → 복습 체크리스트 → 참고 자료 → 연재 탐색` 순서를 지킨다.
- 경로 선택을 단순히 "가장 빠른 길"로 설명하지 않는다.
- 가장 긴 프리픽스 일치, 직접 연결 경로, 기본 경로, 메트릭의 적용 범위를 구분한다.
- 새 글 외 기존 글에서는 인덱스와 탐색 링크만 바꾼다.

---

### Task 1: 기술 주장과 출처 검증

**Files:**
- Read: `docs/superpowers/specs/2026-08-13-routing-and-routing-table-design.md`
- Read: `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`
- Read: `src/content/docs/study/cs/network/index.md`
- Create: `src/content/docs/study/cs/network/routing-and-routing-table.md`

**Interfaces:**
- Consumes: Inflearn 강의 unit `116653`, `131314`; RFC 1812; RFC 4632; Linux `ip-route(8)`
- Produces: 본문에 사용할 검증된 정의, 경로 선택 규칙, 출처 URL

- [ ] **Step 1: 강의 범위를 다시 확인한다**

Inflearn 강의 본문에서 라우팅, 라우터, 라우팅 테이블, 네트워크 대상, 넷마스크, 게이트웨이, 인터페이스, 메트릭, 홉 설명을 확인한다.

- [ ] **Step 2: 가장 긴 프리픽스 일치를 표준 문서로 검증한다**

RFC 1812의 forwarding algorithm과 RFC 4632의 longest-match 설명을 확인한다. 글에는 목적지와 일치하는 경로 중 더 긴 프리픽스가 더 구체적인 경로라는 범위로 반영한다.

- [ ] **Step 3: Linux 경로 출력 필드를 공식 문서로 검증한다**

`ip-route(8)`에서 `default`, `via`, `dev`, `metric`의 의미를 확인한다. 직접 연결 경로에는 `via`가 없을 수 있다는 점을 예제에 반영한다.

- [ ] **Step 4: 검증 기준을 본문 작성 규칙으로 고정한다**

다음 규칙을 사용한다.

```text
1. 목적지 IP와 일치하는 프리픽스를 찾는다.
2. 일치 후보 중 가장 긴 프리픽스를 선택한다.
3. 같은 목적지 후보의 추가 우선순위는 운영체제와 라우팅 정책의 범위에서 해석한다.
4. 선택된 경로의 다음 홉과 출력 인터페이스로 전달한다.
5. 일치하는 구체 경로가 없으면 기본 경로를 검토한다.
```

### Task 2: 네트워크 연재 7편 작성

**Files:**
- Create: `src/content/docs/study/cs/network/routing-and-routing-table.md`

**Interfaces:**
- Consumes: Task 1의 검증 규칙과 출처
- Produces: slug `study/network/routing-and-routing-table`, sidebar order `7`인 완성된 학습 글

- [ ] **Step 1: frontmatter와 도입을 작성한다**

다음 메타데이터를 사용한다.

```yaml
title: "라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블"
description: 라우팅과 라우터의 역할을 구분하고, 라우팅 테이블의 프리픽스·게이트웨이·인터페이스·메트릭을 읽어 패킷의 다음 경로가 선택되는 과정을 정리합니다.
slug: study/network/routing-and-routing-table
contentType: study
publishedAt: 2026-08-13
tags: [Network, Routing, Router, Backend]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 7
```

도입은 라우팅을 결과, 라우터를 장치, 라우팅 테이블을 판단 자료로 구분해야 한다는 중립적 동기로 쓴다.

- [ ] **Step 2: 핵심 요약과 개념 관계를 작성한다**

라우팅은 전달 경로를 선택하고 패킷을 다음 홉으로 보내는 과정, 라우터는 그 일을 수행하는 장치, 라우팅 테이블은 판단에 사용하는 경로 정보라는 관계를 설명한다.

- [ ] **Step 3: 라우팅 테이블 필드 표를 작성한다**

표의 열은 `필드`, `의미`, `읽을 때 확인할 질문`으로 한다. 행은 `목적지 프리픽스`, `게이트웨이·다음 홉`, `출력 인터페이스`, `메트릭`을 포함한다.

- [ ] **Step 4: 가장 긴 프리픽스 일치 예제를 작성한다**

다음 후보를 사용해 `10.20.30.40`에는 `/24`가 선택되고 `8.8.8.8`에는 기본 경로가 검토됨을 설명한다.

```text
10.0.0.0/8      via 192.0.2.1
10.20.30.0/24   via 192.0.2.2
default         via 192.0.2.254
```

- [ ] **Step 5: Linux `ip route` 출력 예제를 작성한다**

다음 형식을 사용한다.

```text
default via 192.0.2.1 dev eth0 metric 100
192.0.2.0/24 dev eth0 proto kernel scope link src 192.0.2.10
10.20.0.0/16 via 192.0.2.2 dev eth0 metric 50
```

`default`, `via`, `dev`, `metric`을 읽고, 직접 연결된 `192.0.2.0/24`에는 별도 게이트웨이가 없음을 설명한다. Windows에서는 강의처럼 `netstat -r`로 경로 테이블을 볼 수 있음을 한 문장으로 덧붙인다.

- [ ] **Step 6: 장점과 한계, 기술면접, 복습 체크리스트를 작성한다**

장점과 한계에서는 경로 요약과 정책 기반 전달의 이점, 테이블만으로 실제 지연시간·혼잡·왕복 경로를 확정할 수 없다는 한계를 다룬다. 기술면접 질문은 설계 문서의 세 질문을 사용하고 답변만 `-습니다`로 쓴다.

- [ ] **Step 7: 참고 자료와 탐색 링크를 작성한다**

강의 두 편, RFC 1812, RFC 4632, Linux `ip-route(8)`를 링크한다. 하단 탐색은 다음 형식을 사용한다.

```markdown
이전: [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](/study/network/tcp-connection-lifecycle/) · [연재 목록](/study/network/)
```

- [ ] **Step 8: 글 단독 검사를 실행한다**

Run: `rg -n 'AUTHOR_INPUT_REQUIRED|TBD|TODO|내가|처음에는|매번|직접 겪어 보니|알고 나니' src/content/docs/study/cs/network/routing-and-routing-table.md`

Expected: 출력 없음.

Run: `git diff --check -- src/content/docs/study/cs/network/routing-and-routing-table.md`

Expected: 출력 없이 종료 코드 0.

### Task 3: 연재 탐색 경로 연결

**Files:**
- Modify: `src/content/docs/study/cs/network/index.md`
- Modify: `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`

**Interfaces:**
- Consumes: Task 2의 slug와 제목
- Produces: 인덱스 7번 항목과 직전 글의 다음 링크

- [ ] **Step 1: 네트워크 인덱스에 7편을 추가한다**

`읽는 순서`의 7번에 다음 링크를 추가한다.

```markdown
7. [라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블](./routing-and-routing-table/)
```

- [ ] **Step 2: 직전 글에 다음 탐색 링크를 추가한다**

`tcp-connection-lifecycle.md`의 마지막 줄을 다음과 같이 바꾼다.

```markdown
이전: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/) · [연재 목록](/study/network/) · 다음: [라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블](/study/network/routing-and-routing-table/)
```

- [ ] **Step 3: 탐색 링크 일관성을 확인한다**

Run: `rg -n 'routing-and-routing-table|sidebar:|order: 7' src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/tcp-connection-lifecycle.md src/content/docs/study/cs/network/routing-and-routing-table.md`

Expected: 인덱스 링크, 직전 글의 다음 링크, 새 글 slug와 order, 새 글의 이전 링크가 출력된다.

### Task 4: 문체·구조·빌드 검증과 커밋

**Files:**
- Verify: `src/content/docs/study/cs/network/routing-and-routing-table.md`
- Verify: `src/content/docs/study/cs/network/index.md`
- Verify: `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`

**Interfaces:**
- Consumes: Tasks 2~3의 완성 파일
- Produces: 검증 결과와 하나의 기능 커밋

- [ ] **Step 1: `writing-review-blog` 최종 체크리스트를 대조한다**

도입, 필수 섹션 순서, 출처, 세 개의 기술면접 질문, 체크리스트, 문체, 개인 경험 경계, 연재 탐색 링크를 확인한다. AI 문체 패턴이 군집으로 남을 때만 `humanizer`를 산문에 적용하고 체크리스트를 다시 실행한다.

- [ ] **Step 2: Astro 콘텐츠 검사를 실행한다**

Run: `pnpm check`

Expected: 오류 0개.

- [ ] **Step 3: 프로덕션 빌드를 실행한다**

Run: `pnpm build`

Expected: 빌드 종료 코드 0이며 새 slug 페이지가 생성된다.

- [ ] **Step 4: 변경 범위를 확인한다**

Run: `git diff --check`

Run: `git status --short`

Run: `git diff -- src/content/docs/study/cs/network/routing-and-routing-table.md src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/tcp-connection-lifecycle.md`

Expected: 공백 오류가 없고 계획한 세 콘텐츠 파일만 구현 변경으로 나타난다.

- [ ] **Step 5: 구현을 커밋한다**

```bash
git add src/content/docs/study/cs/network/routing-and-routing-table.md src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/tcp-connection-lifecycle.md
git commit -m "feat: study 라우팅과 라우팅 테이블 글 추가"
```
