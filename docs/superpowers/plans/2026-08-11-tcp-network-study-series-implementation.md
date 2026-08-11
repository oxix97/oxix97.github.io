# TCP 네트워크 Study 연재 확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 `CS 지식의 정석 - 네트워크` 연재에 TCP/IP 계층, 전송 크기, 연결 생명주기를 설명하는 Study 글 3편과 정확한 SVG 다이어그램 6개를 추가한다.

**Architecture:** `src/content/docs/study/cs/network/`의 기존 허브와 콘텐츠 계약을 3편에서 6편으로 순차 확장한다. 각 신규 글은 독립된 Markdown 문서와 `public/images/study/network/tcp/`의 SVG 두 개를 소비하며, Vitest가 frontmatter·필수 절·내비게이션·이미지 접근성·핵심 정확성을 검증한다. 정적 빌드 검증은 공개 경로와 허브 링크 순서를 확인하고, 마지막에 데스크톱·모바일 및 밝은·어두운 테마에서 시각 QA를 수행한다.

**Tech Stack:** Astro 7.2, Starlight 0.41, Markdown/HTML figure markup, static SVG, TypeScript, Vitest 3.2, Inflearn connector

## Global Constraints

- 새 글은 `contentType: study`, `publishedAt: 2026-08-11`, `series: CS 지식의 정석 - 네트워크`, `topic: Network`, `difficulty: intermediate`를 사용한다.
- 본문은 설명형 `-다` 문체를 사용하고 기술면접 답변만 `-습니다` 문체를 사용한다.
- 각 글은 `핵심 요약`, 개념별 본문, `장점과 한계`, `기술면접 질문`, `복습 체크리스트`, `참고 자료`를 포함한다.
- 각 글의 기술면접 질문은 정확히 3개이고 각 답변은 정확히 세 문장이다.
- 강의 문장을 연속 인용하지 않고 Inflearn 단원과 IETF RFC를 근거로 개념을 재구성한다.
- SVG는 1200×720 viewBox, 동일 팔레트와 선 체계, 구체적인 `<title>`·`<desc>`, 고대비 라벨을 사용한다.
- 본문 SVG는 의미론적 `<figure class="study-diagram">`, 구체적인 `alt`, `<figcaption>`, `loading="lazy"`를 사용한다.
- Mermaid 또는 새 클라이언트 렌더링 의존성을 추가하지 않는다.
- MSS 1460은 기본 IPv4·TCP 헤더를 가정한 예시로만 설명하고 고정값으로 표현하지 않는다.
- TIME_WAIT 주체를 클라이언트로 고정하지 않고 먼저 종료를 시작한 쪽이라는 일반 원칙과 예외 가능성을 설명한다.
- 기존 미추적 `.pnpm-store/`와 사용자 소유 변경은 수정하거나 커밋하지 않는다.

---

## File Structure

### Create

- `src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md`: TCP/IP 계층, PDU, 캡슐화와 역캡슐화를 설명하는 4편.
- `src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md`: TCP·UDP 선택 기준과 MTU·MSS·PMTUD를 설명하는 5편.
- `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`: 연결 수립·해제와 TIME_WAIT을 설명하는 6편.
- `public/images/study/network/tcp/tcp-ip-layer-stack.svg`: 네 계층의 책임·프로토콜·PDU 구조도.
- `public/images/study/network/tcp/tcp-encapsulation-flow.svg`: 송수신 캡슐화·역캡슐화 흐름도.
- `public/images/study/network/tcp/mtu-mss-packet.svg`: MTU 1500과 기본 헤더·MSS의 패킷 단면도.
- `public/images/study/network/tcp/pmtud-path.svg`: 경로 최소 MTU와 ICMP 피드백 흐름도.
- `public/images/study/network/tcp/tcp-three-way-handshake.svg`: 3-way handshake와 상태 전이 시퀀스도.
- `public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg`: 4-way handshake와 TIME_WAIT 시퀀스도.

### Modify

- `src/content/docs/study/cs/network/index.md`: 읽는 순서를 6편으로 확장한다.
- `src/content/docs/study/cs/network/network-classification.md`: 기존 3편에서 새 4편으로 이동하는 다음 링크를 추가한다.
- `src/styles/custom.css`: `.study-diagram`의 반응형 이미지·캡션 스타일을 추가한다.
- `tests/study-network-series.test.ts`: 신규 글·이미지·정확성 콘텐츠 계약을 단계별로 추가한다.
- `scripts/verify-build.mjs`: 신규 정적 경로와 허브의 여섯 링크를 단계별로 검증한다.

---

### Task 1: TCP/IP 계층과 캡슐화 글을 추가한다

**Files:**
- Create: `src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md`
- Create: `public/images/study/network/tcp/tcp-ip-layer-stack.svg`
- Create: `public/images/study/network/tcp/tcp-encapsulation-flow.svg`
- Modify: `src/content/docs/study/cs/network/index.md`
- Modify: `src/content/docs/study/cs/network/network-classification.md`
- Modify: `src/styles/custom.css`
- Modify: `tests/study-network-series.test.ts`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: 기존 `articles`, `expectedNavigation`, `parseFrontmatter`, `extractSection` 콘텐츠 계약과 `/study/network/` 허브.
- Produces: `ImageContract`, `images`·`publishedAt`을 가진 확장 `ArticleContract`, `/study/network/tcp-ip-layers-and-encapsulation/`, 공통 `.study-diagram` 스타일.

- [ ] **Step 1: 네 번째 글과 이미지 접근성을 요구하는 실패 테스트를 작성한다.**

`tests/study-network-series.test.ts`에 다음 타입과 public asset reader를 추가한다.

```ts
type ImageContract = {
  file: string;
  alt: string;
  caption: string;
};

type ArticleContract = {
  file: string;
  title: string;
  order: number;
  publishedAt: string;
  tags: string[];
  units: { title: string; unitId: number }[];
  sections: string[];
  images?: ImageContract[];
};

const publicRoot = new URL('../public/', import.meta.url);
const readPublicFile = (path: string) =>
  readFile(new URL(path, publicRoot), 'utf8');
```

기존 세 article에 `publishedAt: '2026-08-10'`을 추가하고 네 번째 article을 다음 계약으로 추가한다.

```ts
{
  file: 'tcp-ip-layers-and-encapsulation.md',
  title: 'TCP/IP 4계층은 데이터를 어떻게 전달하는가',
  order: 4,
  publishedAt: '2026-08-11',
  tags: ['Network', 'TCPIP', 'Encapsulation', 'Backend'],
  units: [
    {
      title: 'TCP/IP 4계층 #1. 개념, 캡슐화, 비캡슐화, PDU, OSI 7계층 ★★★',
      unitId: 116066,
    },
    {
      title: 'TCP/IP 4계층 #3. 애플리케이션 계층(application) ★★★',
      unitId: 116067,
    },
    {
      title: 'TCP/IP 4계층 #5. 인터넷 계층(network) ★★★',
      unitId: 132275,
    },
  ],
  sections: [
    '핵심 요약',
    'TCP/IP 4계층의 책임',
    '계층별 PDU와 대표 프로토콜',
    '캡슐화와 역캡슐화',
    'OSI 7계층과 어떻게 대응하는가',
    'HTTP 요청이 네트워크를 통과하는 과정',
    '장점과 한계',
    '기술면접 질문',
    '복습 체크리스트',
    '참고 자료',
  ],
  images: [
    {
      file: 'tcp-ip-layer-stack.svg',
      alt: '애플리케이션·전송·인터넷·네트워크 접근 계층의 책임과 PDU를 위에서 아래로 나타낸 TCP/IP 4계층 구조도',
      caption: '각 계층은 정해진 책임과 PDU를 가지며 상위 계층의 데이터를 아래 계층으로 전달한다.',
    },
    {
      file: 'tcp-encapsulation-flow.svg',
      alt: 'HTTP 메시지에 TCP·IP·링크 계층 헤더가 추가되고 수신 측에서 역순으로 제거되는 캡슐화와 역캡슐화 흐름',
      caption: '송신 측은 계층별 헤더를 추가하고 수신 측은 반대 순서로 헤더를 해석한다.',
    },
  ],
}
```

frontmatter 날짜 assertion을 `expect(frontmatter.publishedAt).toBe(article.publishedAt)`로 바꾸고, 면접 답변 총합은 `expect(answerCount).toBe(articles.length * 3)`으로 바꾼다. 이미지 계약 테스트를 추가한다.

```ts
it('keeps accessible static SVG diagrams for each illustrated article', async () => {
  for (const article of articles) {
    const markdown = await readStudyFile(`cs/network/${article.file}`);
    for (const diagram of article.images ?? []) {
      const assetPath = `images/study/network/tcp/${diagram.file}`;
      const svg = await readPublicFile(assetPath);
      expect(svg, diagram.file).toMatch(/^<svg[\s>]/);
      expect(svg, diagram.file).toContain('<title');
      expect(svg, diagram.file).toContain('<desc');
      expect(markdown).toContain(`src="/${assetPath}"`);
      expect(markdown).toContain(`alt="${diagram.alt}"`);
      expect(markdown).toContain('loading="lazy"');
      expect(markdown).toContain(`<figcaption>${diagram.caption}</figcaption>`);
    }
  }
});
```

- [ ] **Step 2: 테스트가 새 글 또는 SVG 부재로 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `tcp-ip-layers-and-encapsulation.md` 또는 SVG 파일이 없다는 `ENOENT`, 허브 링크 순서 불일치, 기존 3편의 다음 링크 불일치 중 하나로 FAIL.

- [ ] **Step 3: 강의와 공식 근거를 읽고 글의 사실 목록을 고정한다.**

Inflearn connector의 `get_lecture_content(courseId=328823, unitId=...)`로 `116066`, `116067`, `132275`를 읽는다. IETF TCP RFC 9293의 계층 간 TCP 인터페이스와 세그먼트 용어를 확인한다. 메모에는 다음 여섯 사실만 남기고 강의 문장을 연속 복사하지 않는다.

1. 애플리케이션 데이터가 전송 계층의 세그먼트로 내려간다.
2. 인터넷 계층은 IP 헤더를 붙여 패킷을 전달한다.
3. 링크 계층은 로컬 링크 전달용 프레임을 만든다.
4. 수신 측은 반대 순서로 헤더를 해석한다.
5. OSI와 TCP/IP 모델의 계층 대응은 학습용 대응이며 구현의 일대일 분리를 보장하지 않는다.
6. 링크 계층 CRC와 TCP 체크섬은 적용 계층과 보호 범위가 다르다.

- [ ] **Step 4: 글의 frontmatter와 본문을 작성한다.**

frontmatter는 정확히 다음 값을 사용한다.

```yaml
---
title: TCP/IP 4계층은 데이터를 어떻게 전달하는가
description: TCP/IP 네 계층의 책임과 PDU를 구분하고 HTTP 데이터가 캡슐화·역캡슐화되는 과정을 정리합니다.
slug: study/network/tcp-ip-layers-and-encapsulation
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCPIP, Encapsulation, Backend]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 4
---
```

필수 절은 테스트 계약 순서대로 작성한다. 4계층 비교표는 `계층 | 책임 | 대표 프로토콜 | PDU` 열을 사용한다. HTTP 요청 예시는 `HTTP 메시지 → TCP 세그먼트 → IP 패킷 → 링크 프레임`과 수신 측의 역순을 설명한다. 기술면접 질문은 `TCP/IP 4계층을 나누는 이유`, `캡슐화와 역캡슐화`, `OSI 7계층과 TCP/IP 4계층의 차이`로 작성한다.

참고 자료에는 세 Inflearn 링크와 `https://www.rfc-editor.org/rfc/rfc9293`을 넣는다. 마지막 줄은 다음과 같다.

```markdown
이전: [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](/study/network/network-classification/) · [연재 목록](/study/network/)
```

- [ ] **Step 5: 두 SVG를 동일 디자인 토큰으로 작성한다.**

두 파일은 `viewBox="0 0 1200 720"`을 사용하고 다음 팔레트를 SVG 내부 스타일로 공유한다.

```css
.bg { fill: #f8fafc; }
.ink { fill: #0f172a; }
.muted { fill: #475569; }
.border { stroke: #cbd5e1; }
.blue { fill: #2563eb; }
.violet { fill: #7c3aed; }
.green { fill: #059669; }
.amber { fill: #d97706; }
.danger { fill: #dc2626; }
.line { fill: none; stroke: #334155; stroke-width: 3; }
text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
```

`tcp-ip-layer-stack.svg`는 네 개의 수평 계층 카드와 `책임`, `프로토콜`, `PDU` 라벨을 배치한다. `tcp-encapsulation-flow.svg`는 송신 측 네 단계, 중앙 전송 화살표, 수신 측 네 단계를 좌우 대칭으로 배치하고 헤더가 누적·제거되는 모습을 색 블록으로 표현한다. SVG 내부에는 각각 고유한 `<title id="...">`과 `<desc id="...">`를 두고 루트 `<svg>`에 `aria-labelledby`를 연결한다.

본문에는 다음 figure 계약을 정확히 사용한다.

```html
<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-ip-layer-stack.svg"
    alt="애플리케이션·전송·인터넷·네트워크 접근 계층의 책임과 PDU를 위에서 아래로 나타낸 TCP/IP 4계층 구조도"
    loading="lazy"
  />
  <figcaption>각 계층은 정해진 책임과 PDU를 가지며 상위 계층의 데이터를 아래 계층으로 전달한다.</figcaption>
</figure>
```

두 번째 figure도 계약의 `src`, `alt`, caption을 그대로 사용한다.

- [ ] **Step 6: 공통 다이어그램 스타일을 추가한다.**

`src/styles/custom.css`에 다음 스타일을 추가한다.

```css
.sl-markdown-content .study-diagram {
  margin-block: 1.75rem;
}

.sl-markdown-content .study-diagram img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--sl-rapide-ui-border-color);
  border-radius: 0.75rem;
  background: #f8fafc;
}

.sl-markdown-content .study-diagram figcaption {
  margin-top: 0.65rem;
  color: var(--sl-color-gray-2);
  font-size: 0.875rem;
  line-height: 1.6;
  text-align: center;
}
```

- [ ] **Step 7: 허브, 이전 글, 정적 빌드 검증을 네 번째 글까지 연결한다.**

`src/content/docs/study/cs/network/index.md`의 읽는 순서에 네 번째 링크를 추가한다. `network-classification.md` 마지막 줄은 다음으로 바꾼다.

```markdown
이전: [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](/study/network/topology-and-bottlenecks/) · [연재 목록](/study/network/) · 다음: [TCP/IP 4계층은 데이터를 어떻게 전달하는가](/study/network/tcp-ip-layers-and-encapsulation/)
```

`scripts/verify-build.mjs`의 `expectedFiles`에 `study/network/tcp-ip-layers-and-encapsulation/index.html`을 추가하고 `expectedNetworkLinks`에 같은 제목과 `./tcp-ip-layers-and-encapsulation/`을 추가한다.

- [ ] **Step 8: 네 번째 글의 전체 계약과 정적 출력을 검증한다.**

Run: `npm run check`

Expected: exit 0, Astro 콘텐츠·HTML 오류 0개.

Run: `npm test -- tests/study-network-series.test.ts`

Expected: PASS, 네 글의 계약과 SVG 2개 검증 통과.

Run: `npm run build && npm run verify:build`

Expected: exit 0, 네 번째 공개 경로와 허브 링크 순서 검증 통과.

- [ ] **Step 9: 첫 번째 기능 단위를 커밋한다.**

```bash
git add src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/network-classification.md src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md src/styles/custom.css public/images/study/network/tcp/tcp-ip-layer-stack.svg public/images/study/network/tcp/tcp-encapsulation-flow.svg tests/study-network-series.test.ts scripts/verify-build.mjs
git commit -m "feat: study TCP IP 계층과 캡슐화 글 추가"
```

---

### Task 2: TCP·UDP와 전송 크기 글을 추가한다

**Files:**
- Create: `src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md`
- Create: `public/images/study/network/tcp/mtu-mss-packet.svg`
- Create: `public/images/study/network/tcp/pmtud-path.svg`
- Modify: `src/content/docs/study/cs/network/index.md`
- Modify: `src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md`
- Modify: `tests/study-network-series.test.ts`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: Task 1의 `ImageContract`, `.study-diagram`, 네 번째 글 경로와 동적 내비게이션 계약.
- Produces: `/study/network/tcp-udp-mtu-mss-pmtud/`, MSS 조건부 예시와 PMTUD 실패 조건 계약, SVG 두 개.

- [ ] **Step 1: 다섯 번째 글의 콘텐츠·이미지·정확성 실패 계약을 추가한다.**

`articles`에 다음 계약을 추가한다.

```ts
{
  file: 'tcp-udp-mtu-mss-pmtud.md',
  title: 'TCP와 UDP, 그리고 MTU·MSS·PMTUD',
  order: 5,
  publishedAt: '2026-08-11',
  tags: ['Network', 'TCP', 'UDP', 'PMTUD'],
  units: [
    {
      title: 'TCP/IP 4계층 #4. 전송 계층(transport) ★★★',
      unitId: 132274,
    },
    {
      title: 'TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★',
      unitId: 116686,
    },
  ],
  sections: [
    '핵심 요약',
    'TCP와 UDP의 선택 기준',
    'TCP의 신뢰성을 구성하는 장치',
    'MTU와 MSS의 차이',
    'PMTUD가 경로 크기를 찾는 방법',
    '운영에서 확인할 실패 조건',
    '장점과 한계',
    '기술면접 질문',
    '복습 체크리스트',
    '참고 자료',
  ],
  images: [
    {
      file: 'mtu-mss-packet.svg',
      alt: 'Ethernet MTU 1500바이트가 IPv4 기본 헤더 20바이트, TCP 기본 헤더 20바이트, 데이터 1460바이트로 나뉘는 패킷 단면도',
      caption: 'MSS 1460바이트는 Ethernet MTU 1500과 IPv4·TCP 기본 헤더를 가정한 예시다.',
    },
    {
      file: 'pmtud-path.svg',
      alt: '송신자와 수신자 사이에서 가장 작은 링크 MTU를 ICMP 피드백으로 찾고 패킷 크기를 줄이는 PMTUD 경로도',
      caption: 'PMTUD는 경로에서 통과 가능한 최대 패킷 크기를 찾고 송신 크기를 조정한다.',
    },
  ],
}
```

다음 정확성 테스트를 추가한다.

```ts
it('keeps MSS and PMTUD examples conditional and operationally accurate', async () => {
  const markdown = await readStudyFile('cs/network/tcp-udp-mtu-mss-pmtud.md');
  const mss = extractSection(markdown, 'MTU와 MSS의 차이');
  const pmtud = extractSection(markdown, 'PMTUD가 경로 크기를 찾는 방법');
  expect(mss).toMatch(/1500[\s\S]*20[\s\S]*20[\s\S]*1460/);
  expect(mss).toMatch(/예시|고정값이 아니/);
  expect(mss).toMatch(/IPv6|옵션|터널링/);
  expect(pmtud).toMatch(/ICMP/);
  expect(pmtud).toMatch(/IPv4[\s\S]*IPv6|IPv6[\s\S]*IPv4/);
  expect(markdown).toMatch(/PMTUD Black Hole/);
});
```

- [ ] **Step 2: 테스트가 다섯 번째 글 부재로 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `tcp-udp-mtu-mss-pmtud.md` 또는 새 SVG가 없다는 `ENOENT`로 FAIL.

- [ ] **Step 3: 강의와 공식 근거에서 전송 크기 규칙을 확인한다.**

Inflearn 단원 `132274`, `116686`을 읽고 RFC 9293, UDP RFC 768, IPv4 PMTUD RFC 1191, IPv6 PMTUD RFC 8201을 확인한다. 본문에 사용할 사실을 다음으로 제한한다.

1. TCP는 순서, ACK, 재전송, 체크섬을 조합해 신뢰성 있는 바이트 스트림을 제공한다.
2. UDP는 연결 설정과 신뢰성 메커니즘을 최소화하지만 애플리케이션이 필요한 보장을 별도로 설계해야 한다.
3. MTU는 IP 패킷이 링크에서 전달될 수 있는 크기 상한이고 MSS는 TCP 데이터 크기의 상한을 설명한다.
4. 1500·20·20·1460은 기본 Ethernet/IPv4/TCP 헤더를 가정한 예시다.
5. IPv4 라우터 단편화와 IPv6 송신자 단편화의 차이를 구분한다.
6. PMTUD에 필요한 ICMP가 차단되면 큰 패킷이 반복적으로 실패하는 Black Hole 증상이 생길 수 있다.

- [ ] **Step 4: 다섯 번째 글을 작성한다.**

```yaml
---
title: TCP와 UDP, 그리고 MTU·MSS·PMTUD
description: TCP와 UDP의 보장 차이를 비교하고 MTU·MSS·PMTUD가 실제 전송 크기를 결정하는 과정을 정리합니다.
slug: study/network/tcp-udp-mtu-mss-pmtud
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCP, UDP, PMTUD]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 5
---
```

필수 절은 계약 순서대로 작성한다. TCP·UDP 표는 `연결 준비 | 순서·재전송 | 데이터 경계 | 헤더 부담 | 선택 기준` 열을 사용한다. 신뢰성 절은 핸드셰이크만이 아니라 시퀀스 번호·ACK·재전송·체크섬을 함께 설명한다. 운영 절은 PMTUD Black Hole을 단정하지 않고 큰 응답 실패, ICMP 도달 여부, 터널·VPN·로드밸런서 경로를 함께 확인하는 진단 순서를 제시한다.

기술면접 질문은 `TCP와 UDP의 차이`, `MTU와 MSS의 차이`, `PMTUD가 필요한 이유`로 작성한다. 참고 자료에는 두 Inflearn 링크와 RFC 9293, 768, 1191, 8201을 연결한다. 마지막 줄은 다음과 같다.

```markdown
이전: [TCP/IP 4계층은 데이터를 어떻게 전달하는가](/study/network/tcp-ip-layers-and-encapsulation/) · [연재 목록](/study/network/)
```

- [ ] **Step 5: MTU·MSS와 PMTUD SVG를 작성한다.**

Task 1의 1200×720 viewBox와 팔레트를 그대로 사용한다. `mtu-mss-packet.svg`는 전체 1500바이트 막대를 IPv4 기본 헤더 20, TCP 기본 헤더 20, 데이터 1460으로 나누고 아래에 조건부 예시라는 경고 카드를 둔다. `pmtud-path.svg`는 송신자, MTU 1500 링크, MTU 1400 링크, 수신자를 왼쪽에서 오른쪽으로 배치하고 1500바이트 시도, ICMP 피드백, 1400바이트 이하 재전송을 세 단계로 표현한다. IPv4와 IPv6 세부 동작이 완전히 같지 않다는 주석을 이미지 하단에 둔다.

본문 figure는 계약에 정의한 `src`, `alt`, caption을 정확히 사용한다.

- [ ] **Step 6: 허브, 네 번째 글 내비게이션, 정적 빌드 계약을 확장한다.**

허브에 다섯 번째 링크를 추가하고 4편 마지막 줄을 다음으로 바꾼다.

```markdown
이전: [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](/study/network/network-classification/) · [연재 목록](/study/network/) · 다음: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/)
```

`scripts/verify-build.mjs`에 `study/network/tcp-udp-mtu-mss-pmtud/index.html`과 `./tcp-udp-mtu-mss-pmtud/` 허브 링크를 추가한다.

- [ ] **Step 7: 다섯 번째 글과 전체 정적 출력을 검증한다.**

Run: `npm run check`

Expected: exit 0.

Run: `npm test -- tests/study-network-series.test.ts`

Expected: PASS, 다섯 글·SVG 4개·MSS/PMTUD 정확성 계약 통과.

Run: `npm run build && npm run verify:build`

Expected: exit 0, 다섯 번째 공개 경로와 허브 링크 순서 검증 통과.

- [ ] **Step 8: 두 번째 기능 단위를 커밋한다.**

```bash
git add src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md public/images/study/network/tcp/mtu-mss-packet.svg public/images/study/network/tcp/pmtud-path.svg tests/study-network-series.test.ts scripts/verify-build.mjs
git commit -m "feat: study TCP UDP와 전송 크기 글 추가"
```

---

### Task 3: TCP 연결 생명주기 글을 추가한다

**Files:**
- Create: `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`
- Create: `public/images/study/network/tcp/tcp-three-way-handshake.svg`
- Create: `public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg`
- Modify: `src/content/docs/study/cs/network/index.md`
- Modify: `src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md`
- Modify: `tests/study-network-series.test.ts`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: Task 2까지 이어진 네트워크 허브, SVG 접근성 계약, 동적 면접 답변·내비게이션 계약.
- Produces: `/study/network/tcp-connection-lifecycle/`, 3-way·4-way 상태 전이 SVG, 완성된 여섯 글 연재 체인.

- [ ] **Step 1: 여섯 번째 글과 TIME_WAIT 정확성 실패 계약을 추가한다.**

`articles`에 다음 계약을 추가한다.

```ts
{
  file: 'tcp-connection-lifecycle.md',
  title: 'TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지',
  order: 6,
  publishedAt: '2026-08-11',
  tags: ['Network', 'TCP', 'Handshake', 'TIME_WAIT'],
  units: [
    {
      title: 'TCP의 연결성립 : 3-웨이 핸드셰이크 ★★★',
      unitId: 116078,
    },
    {
      title: 'TCP의 연결해제 : 4-웨이 핸드셰이크와TIME_WAIT ★★★',
      unitId: 130876,
    },
  ],
  sections: [
    '핵심 요약',
    '3-way handshake가 확인하는 것',
    'ISN과 Sequence·Acknowledgement Number',
    '4-way handshake에서 FIN과 ACK가 분리되는 이유',
    'TIME_WAIT이 필요한 이유',
    'CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법',
    '장점과 한계',
    '기술면접 질문',
    '복습 체크리스트',
    '참고 자료',
  ],
  images: [
    {
      file: 'tcp-three-way-handshake.svg',
      alt: '연결 시작 측과 수신 측이 SYN, SYN-ACK, ACK를 교환하며 ESTABLISHED 상태가 되는 3-way handshake 시퀀스도',
      caption: '3-way handshake는 양쪽의 통신 가능 여부와 초기 시퀀스 번호를 확인한다.',
    },
    {
      file: 'tcp-four-way-handshake-time-wait.svg',
      alt: '종료 시작 측과 상대 측이 FIN과 ACK를 교환하고 종료 시작 측이 TIME_WAIT에 머무르는 4-way handshake 상태 전이도',
      caption: '먼저 종료를 시작한 쪽은 마지막 ACK와 지연 패킷을 처리하기 위해 TIME_WAIT에 머무를 수 있다.',
    },
  ],
}
```

다음 정확성 계약을 추가한다.

```ts
it('explains TIME_WAIT without fixing the role to the client', async () => {
  const markdown = await readStudyFile('cs/network/tcp-connection-lifecycle.md');
  const timeWait = extractSection(markdown, 'TIME_WAIT이 필요한 이유');
  const operations = extractSection(
    markdown,
    'CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법',
  );
  expect(timeWait).toMatch(/먼저 종료를 시작한 쪽|active close/);
  expect(timeWait).toMatch(/항상 클라이언트가 아니|클라이언트로 고정/);
  expect(timeWait).toMatch(/2MSL/);
  expect(operations).toMatch(/운영체제|설정/);
  expect(operations).toMatch(/수치만으로|단정/);
});
```

- [ ] **Step 2: 테스트가 여섯 번째 글 부재로 실패하는지 확인한다.**

Run: `npm test -- tests/study-network-series.test.ts`

Expected: `tcp-connection-lifecycle.md` 또는 handshake SVG 부재로 FAIL.

- [ ] **Step 3: 강의와 RFC에서 상태 전이 근거를 확인한다.**

Inflearn 단원 `116078`, `130876`과 RFC 9293의 상태 전이·연결 종료 절을 읽는다. 다음 사실을 본문의 기준으로 사용한다.

1. SYN은 시퀀스 공간 한 칸을 소비하므로 ACK는 상대 ISN에 1을 더한다.
2. 3-way handshake는 양쪽 통신 가능성과 초기 시퀀스 번호를 확인한다.
3. TCP는 양방향 스트림을 독립적으로 닫으므로 FIN과 ACK가 분리될 수 있다.
4. 먼저 종료를 시작한 쪽은 마지막 ACK 재전송과 지연 세그먼트 제거를 위해 TIME_WAIT에 머무를 수 있다.
5. CLOSE_WAIT은 상대 FIN을 받은 뒤 로컬 애플리케이션의 close 완료를 기다리는 상태다.
6. TIME_WAIT 개수와 2MSL 실제 시간은 역할·트래픽·운영체제 설정을 함께 보아야 한다.

- [ ] **Step 4: 여섯 번째 글을 작성한다.**

```yaml
---
title: "TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지"
description: TCP의 연결 수립과 종료 과정에서 시퀀스 번호와 상태가 어떻게 바뀌며 TIME_WAIT이 왜 필요한지 정리합니다.
slug: study/network/tcp-connection-lifecycle
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCP, Handshake, TIME_WAIT]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 6
---
```

필수 절은 계약 순서를 따른다. 3-way 절은 `SYN seq=x`, `SYN-ACK seq=y ack=x+1`, `ACK ack=y+1`을 본문과 그림에서 동일하게 사용한다. 4-way 절은 수신 측 애플리케이션이 남은 데이터를 처리한 뒤 FIN을 보낼 수 있어 ACK와 FIN이 분리된다고 설명한다. TIME_WAIT 절은 마지막 ACK 재전송과 이전 연결의 지연 세그먼트가 같은 4-tuple의 새 연결에 섞이는 위험을 다룬다.

운영 절은 CLOSE_WAIT 증가 시 애플리케이션 소켓 close 흐름을, TIME_WAIT 증가 시 active closer·요청량·포트 범위·재사용 정책을 함께 확인하되 수치만으로 장애를 단정하지 않는다. 기술면접 질문은 `3-way handshake가 필요한 이유`, `4-way handshake에서 FIN과 ACK가 분리되는 이유`, `TIME_WAIT이 필요한 이유`로 작성한다.

참고 자료에는 두 Inflearn 링크와 RFC 9293을 넣는다. 마지막 줄은 다음과 같다.

```markdown
이전: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/) · [연재 목록](/study/network/)
```

- [ ] **Step 5: 연결 수립·종료 SVG를 작성한다.**

Task 1의 1200×720 viewBox와 팔레트를 사용한다. 두 그림 모두 왼쪽과 오른쪽 수직 생명선을 두고 위에서 아래로 시간이 흐르게 한다.

`tcp-three-way-handshake.svg`는 왼쪽 `연결 시작 측`, 오른쪽 `수신 측`을 배치한다. 화살표는 SYN, SYN-ACK, ACK 순서이며 각 화살표에 seq·ack 값을 표기한다. 상태 칩은 왼쪽 `CLOSED → SYN_SENT → ESTABLISHED`, 오른쪽 `LISTEN → SYN_RECEIVED → ESTABLISHED`를 표시한다.

`tcp-four-way-handshake-time-wait.svg`는 왼쪽 `종료 시작 측`, 오른쪽 `상대 측`을 배치한다. 왼쪽 상태는 `ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED`, 오른쪽 상태는 `ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED`를 표시한다. TIME_WAIT 카드에는 `마지막 ACK 재전송`과 `지연 세그먼트 만료` 두 이유를 넣는다.

본문 figure는 계약의 `src`, `alt`, caption을 정확히 사용한다.

- [ ] **Step 6: 허브, 다섯 번째 글 내비게이션, 빌드 검증을 여섯 편으로 완성한다.**

허브에 여섯 번째 링크를 추가하고 5편 마지막 줄을 다음으로 바꾼다.

```markdown
이전: [TCP/IP 4계층은 데이터를 어떻게 전달하는가](/study/network/tcp-ip-layers-and-encapsulation/) · [연재 목록](/study/network/) · 다음: [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](/study/network/tcp-connection-lifecycle/)
```

`scripts/verify-build.mjs`에 `study/network/tcp-connection-lifecycle/index.html`과 `./tcp-connection-lifecycle/` 허브 링크를 추가한다.

- [ ] **Step 7: 완성된 여섯 편 연재를 자동 검증한다.**

Run: `npm run check`

Expected: exit 0.

Run: `npm test`

Expected: 전체 Vitest PASS, 네트워크 연재 여섯 글·SVG 6개·면접 답변 18개 검증 통과.

Run: `npm run build && npm run verify:build`

Expected: exit 0, 신규 경로 3개와 허브 여섯 링크 검증 통과.

- [ ] **Step 8: 세 번째 기능 단위를 커밋한다.**

```bash
git add src/content/docs/study/cs/network/index.md src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md src/content/docs/study/cs/network/tcp-connection-lifecycle.md public/images/study/network/tcp/tcp-three-way-handshake.svg public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg tests/study-network-series.test.ts scripts/verify-build.mjs
git commit -m "feat: study TCP 연결 생명주기 글 추가"
```

---

### Task 4: 다이어그램과 전체 연재를 시각 검증한다

**Files:**
- Verify: `src/content/docs/study/cs/network/*.md`
- Verify: `public/images/study/network/tcp/*.svg`
- Verify: `src/styles/custom.css`

**Interfaces:**
- Consumes: Task 1~3의 정적 빌드와 공개 경로 3개.
- Produces: 데스크톱·모바일 및 밝은·어두운 테마에서 읽을 수 있는 최종 콘텐츠와 검증 근거.

- [ ] **Step 1: 최종 자동 검증을 새로 실행한다.**

Run: `npm run check && npm test && npm run build && npm run verify:build && git diff --check`

Expected: 모든 명령 exit 0, Vitest 실패 0개, 신규 정적 경로 3개 존재, whitespace 오류 0개.

- [ ] **Step 2: production preview를 실행한다.**

Run: `npm run preview -- --host 127.0.0.1 --port 4321`

Expected: preview server가 `http://127.0.0.1:4321`에서 실행된다.

- [ ] **Step 3: 데스크톱 1440×900에서 세 글을 확인한다.**

다음 경로를 순서대로 연다.

- `/study/network/tcp-ip-layers-and-encapsulation/`
- `/study/network/tcp-udp-mtu-mss-pmtud/`
- `/study/network/tcp-connection-lifecycle/`

각 페이지에서 H1, 목차, SVG 2개, 캡션 2개, 참고 링크, 이전·목록·다음 링크를 확인한다. 모든 SVG 글자가 읽히고, 선과 라벨이 겹치지 않으며, 본문 너비를 넘는 가로 스크롤이 없어야 한다.

- [ ] **Step 4: 모바일 390×844에서 세 글을 확인한다.**

같은 세 경로에서 문서 자체의 `scrollWidth`가 `clientWidth`를 넘지 않는지 확인한다. SVG는 컨테이너 너비에 맞게 축소되고 캡션은 잘리지 않아야 한다. 축소된 SVG 내부의 핵심 라벨을 읽을 수 없는 경우 해당 SVG의 요소 수를 줄이고 세로 간격을 넓힌 뒤 Step 1과 Step 4를 다시 실행한다.

- [ ] **Step 5: 밝은 테마와 어두운 테마에서 대비를 확인한다.**

세 페이지에서 테마를 각각 밝게·어둡게 전환한다. SVG의 밝은 카드 배경, 본문 테두리, 캡션, 본문 링크가 두 테마 모두에서 구분되어야 한다. 색상만으로 구분되는 상태가 없어야 하며 모든 화살표에 텍스트 라벨이 있어야 한다.

- [ ] **Step 6: 최종 상태와 커밋 범위를 확인한다.**

Run: `git status --short`

Expected: `.pnpm-store/` 외에 의도하지 않은 파일이 없고, 시각 QA 보정이 있었다면 해당 Markdown·SVG·CSS 파일만 수정 상태다.

시각 QA 보정 파일이 있으면 다음 메시지로 한 번만 커밋한다. 보정 파일이 없으면 빈 커밋을 만들지 않는다.

```bash
git add src/content/docs/study/cs/network public/images/study/network/tcp src/styles/custom.css
git commit -m "fix: study TCP 다이어그램 가독성 보완"
```
