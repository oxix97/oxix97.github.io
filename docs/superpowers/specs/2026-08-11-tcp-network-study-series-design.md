# TCP 네트워크 Study 연재 확장 설계

## 목적

Inflearn `CS 지식의 정석` 네트워크 섹션의 TCP 관련 7개 강의를 기존
`CS 지식의 정석 - 네트워크` 연재의 4~6편으로 정리한다. 독자가 TCP/IP
계층을 암기하는 데 그치지 않고 데이터가 캡슐화되는 과정, 전송 크기가
결정되는 원리, TCP 연결의 시작과 종료를 하나의 흐름으로 설명할 수 있게
하는 것이 목표다.

각 글은 하나의 핵심 질문에 답하며, 기존 네트워크 글의 구조와 문체를
유지한다. 텍스트만으로 이해하기 어려운 계층·패킷·상태 전이는 정확한 정적
SVG 다이어그램으로 보완한다.

## 기존 연재와의 연결

새로운 TCP 전용 허브를 만들지 않고 기존 허브
`src/content/docs/study/cs/network/index.md`의 읽기 순서를 6편으로
확장한다. 현재 마지막 글인 `network-classification.md`의 다음 글 링크를
새 4편으로 연결하고, 이후 세 글은 기존 규칙대로 `이전 · 연재 목록 · 다음`
내비게이션을 이어 간다.

Study 최상위 인덱스는 이미 `/study/network/`를 연결하고 있으므로 수정하지
않는다.

## 추가할 글

| 순서 | 파일 | 제목 | 경로 |
| --- | --- | --- | --- |
| 4 | `tcp-ip-layers-and-encapsulation.md` | TCP/IP 4계층은 데이터를 어떻게 전달하는가 | `/study/network/tcp-ip-layers-and-encapsulation/` |
| 5 | `tcp-udp-mtu-mss-pmtud.md` | TCP와 UDP, 그리고 MTU·MSS·PMTUD | `/study/network/tcp-udp-mtu-mss-pmtud/` |
| 6 | `tcp-connection-lifecycle.md` | TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지 | `/study/network/tcp-connection-lifecycle/` |

세 글은 다음 공통 frontmatter를 따른다.

- `contentType: study`
- `publishedAt: 2026-08-11`
- `series: CS 지식의 정석 - 네트워크`
- `topic: Network`
- `difficulty: intermediate`
- `sidebar.order`: 글 순서에 따라 4, 5, 6
- `slug`: 위 표의 공개 경로와 일치하는 명시적 slug

태그는 각 글의 검색 주제를 반영한다.

- 4편: `Network`, `TCPIP`, `Encapsulation`, `Backend`
- 5편: `Network`, `TCP`, `UDP`, `PMTUD`
- 6편: `Network`, `TCP`, `Handshake`, `TIME_WAIT`

## 공통 콘텐츠 구조

각 글은 기존 네트워크 연재와 같은 순서를 사용한다.

1. `핵심 요약`에서 글이 답할 질문과 중요한 구분을 먼저 제시한다.
2. 정의·책임·선택 기준은 비교표로 정리한다.
3. 계층, 패킷 크기, 상태 전이는 SVG 다이어그램과 캡션으로 설명한다.
4. REST API 등 일반화된 백엔드 요청 흐름으로 개념을 연결한다.
5. `장점과 한계`에서 기술이 제공하는 보장과 경계 조건을 구분한다.
6. `기술면접 질문`은 3개를 두며 각 답변은 정확히 세 문장으로 쓴다.
7. `복습 체크리스트`는 4~6개 항목으로 구성한다.
8. `참고 자료`에는 관련 Inflearn 단원과 공식 IETF RFC를 연결한다.
9. 마지막 줄에는 존재하는 이전 글, 연재 목록, 다음 글을 연결한다.

본문은 설명형 `-다` 문체를 사용하고 기술면접 답변만 `-습니다` 문체를
사용한다. 강의 문장을 연속 인용하지 않고 개념을 개인 언어로 재구성한다.

## 4편 설계: TCP/IP 4계층은 데이터를 어떻게 전달하는가

### 다룰 강의

- 단원 `116066`: TCP/IP 4계층, 캡슐화·역캡슐화, 계층별 PDU, OSI 비교
- 단원 `116067`: 애플리케이션 계층과 대표 프로토콜
- 단원 `132275`: 인터넷 계층과 IP 패킷 전달

### 글이 답할 질문

HTTP 요청 데이터가 애플리케이션에서 출발해 어떻게 TCP 세그먼트, IP 패킷,
링크 계층 프레임으로 바뀌고 수신 측에서 다시 복원되는가?

### 주요 절

- `TCP/IP 4계층의 책임`
- `계층별 PDU와 대표 프로토콜`
- `캡슐화와 역캡슐화`
- `OSI 7계층과 어떻게 대응하는가`
- `HTTP 요청이 네트워크를 통과하는 과정`

계층 비교표는 애플리케이션·전송·인터넷·네트워크 접근 계층을 책임, 대표
프로토콜, PDU라는 동일한 기준으로 비교한다. OSI 7계층과 TCP/IP 4계층의
대응은 학습 모델 간의 대응 관계이며 실제 구현이 항상 일대일로 분리되는
것은 아니라는 한계를 함께 설명한다.

### 이미지

1. `tcp-ip-layer-stack.svg`
   - 네 계층의 책임, 대표 프로토콜, PDU를 세로 스택으로 표현한다.
   - HTTP·SSH 등 애플리케이션 프로토콜이 TCP/IP 계층 위에서 데이터를
     만든다는 출발점을 보여 준다.
2. `tcp-encapsulation-flow.svg`
   - 송신 측의 헤더 추가와 수신 측의 헤더 제거를 좌우 대칭으로 표현한다.
   - `메시지 → 세그먼트 → 패킷 → 프레임` 변화를 강조한다.

CRC는 링크 계층의 오류 검출이고 TCP 체크섬은 전송 계층의 검증이라는 점을
구분한다.

## 5편 설계: TCP와 UDP, 그리고 MTU·MSS·PMTUD

### 다룰 강의

- 단원 `132274`: 전송 계층, TCP와 UDP, 연결 지향성과 신뢰성
- 단원 `116686`: MTU, MSS, 경로 MTU, PMTUD

### 글이 답할 질문

TCP와 UDP는 어떤 보장을 제공하며, TCP가 한 번에 전달할 수 있는 데이터의
크기는 네트워크 경로에서 어떻게 결정되는가?

### 주요 절

- `TCP와 UDP의 선택 기준`
- `TCP의 신뢰성을 구성하는 장치`
- `MTU와 MSS의 차이`
- `PMTUD가 경로 크기를 찾는 방법`
- `운영에서 확인할 실패 조건`

TCP와 UDP는 연결 방식, 순서 보장, 재전송, 헤더 부담, 대표 사용 사례를
같은 표에서 비교한다. TCP 신뢰성은 핸드셰이크 하나가 아니라 시퀀스 번호,
ACK, 재전송, 체크섬 등의 조합으로 만들어진다는 점을 중심에 둔다.

### 이미지

1. `mtu-mss-packet.svg`
   - 일반적인 Ethernet MTU 1500바이트에서 IPv4 헤더 20바이트, TCP 헤더
     20바이트, 데이터 1460바이트로 나뉘는 예를 보여 준다.
   - `MSS = MTU - IP 헤더 - TCP 헤더` 관계를 표시한다.
2. `pmtud-path.svg`
   - 송신자와 수신자 사이의 여러 링크 중 가장 작은 MTU가 경로 MTU가 되는
     과정을 나타낸다.
   - 패킷 크기 조정과 ICMP 오류 메시지의 역할을 연결한다.

MSS 1460바이트는 일반적인 Ethernet/IPv4 환경에서 IP·TCP 기본 헤더를 각각
20바이트로 가정한 단순화된 예시일 뿐 고정값이 아님을 명시한다. 실제 한
세그먼트의 데이터 크기는 IP·TCP 옵션, IPv6, 터널링, 경로 조건의 영향을
받을 수 있다. IPv4와 IPv6의 단편화 주체가 다르며, 필요한 ICMP 메시지가
차단되면 PMTUD Black Hole이 발생할 수 있다는 운영 조건도 설명한다.

## 6편 설계: TCP 연결의 생명주기

### 다룰 강의

- 단원 `116078`: 3-way handshake, ISN, 시퀀스·확인 번호, 연결 상태
- 단원 `130876`: 4-way handshake, 연결 종료 상태, TIME_WAIT, 2MSL

### 글이 답할 질문

TCP 양쪽 끝은 연결 준비 상태와 초기 시퀀스 번호를 어떻게 확인하고, 데이터
전송이 끝난 뒤 왜 여러 상태를 거쳐 연결을 종료하는가?

### 주요 절

- `3-way handshake가 확인하는 것`
- `ISN과 Sequence·Acknowledgement Number`
- `4-way handshake에서 FIN과 ACK가 분리되는 이유`
- `TIME_WAIT이 필요한 이유`
- `CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법`

### 이미지

1. `tcp-three-way-handshake.svg`
   - `SYN seq=x`, `SYN-ACK seq=y ack=x+1`, `ACK ack=y+1` 흐름을 표현한다.
   - `LISTEN`, `SYN_SENT`, `SYN_RECEIVED`, `ESTABLISHED` 상태를 함께 표시한다.
2. `tcp-four-way-handshake-time-wait.svg`
   - 종료 시작 측과 상대 측 사이의 FIN·ACK 교환을 표현한다.
   - `FIN_WAIT_1`, `FIN_WAIT_2`, `CLOSE_WAIT`, `LAST_ACK`, `TIME_WAIT` 상태를
     함께 표시하고 TIME_WAIT 구간을 강조한다.

종료 그림은 클라이언트와 서버가 아니라 `종료 시작 측`과 `상대 측`으로
표기한다. TIME_WAIT은 먼저 종료를 시작한 쪽에 생길 수 있고, TIME_WAIT
연결이 많다는 사실만으로 장애라고 단정할 수 없음을 설명한다. CLOSE_WAIT은
상대의 FIN을 받은 뒤 로컬 애플리케이션이 종료를 완료하지 않은 상태이므로
애플리케이션의 소켓 정리 흐름과 함께 관찰한다. 2MSL의 실제 유지 시간은
운영체제와 설정에 따라 달라질 수 있음을 명시한다.

## 시각 디자인과 접근성

SVG 6개는 `public/images/study/network/tcp/`에 저장한다. 별도 Mermaid 또는
클라이언트 렌더링 의존성은 추가하지 않는다.

- 동일한 색상, 선 굵기, 화살표, 카드 모서리 체계를 사용한다.
- 계층·헤더·페이로드·정상 흐름·주의 상태에 일관된 색을 배정한다.
- 색상만으로 의미를 전달하지 않고 라벨과 선 모양을 함께 사용한다.
- 작은 화면에서도 읽히도록 한 이미지의 핵심 메시지를 하나로 제한한다.
- 본문에는 의미가 구체적인 `alt`, 설명 캡션, `loading="lazy"`를 포함한다.
- SVG 내부 글자가 축소되어 읽히지 않는 경우 요소를 줄이거나 이미지를
  세로형으로 재배치한다.
- 밝은 배경의 독립 카드 형태로 만들어 사이트의 밝은 테마와 어두운 테마에서
  모두 충분한 대비를 유지한다.

마크다운에서는 의미론적 `<figure>`와 `<figcaption>`을 사용한다. 현재 테마의
기본 이미지 스타일만으로 여백과 테두리가 충분하지 않을 때만
`src/styles/custom.css`에 `.study-diagram` 범위의 최소 스타일을 추가한다.

## 정확성 기준

- 핸드셰이크만으로 TCP의 신뢰성이 만들어진다고 설명하지 않는다.
- MSS 1460바이트를 일반적인 예시로만 사용한다.
- TIME_WAIT 주체를 항상 클라이언트로 고정하지 않는다.
- TIME_WAIT 수치만으로 장애 여부를 판단하지 않는다.
- 2MSL의 실제 시간을 특정 운영체제 공통의 고정값으로 단정하지 않는다.
- 링크 계층 CRC와 전송 계층 TCP 체크섬을 구분한다.
- IPv4와 IPv6의 단편화·PMTUD 차이를 같은 동작으로 일반화하지 않는다.
- 실제 프로젝트 인프라나 성능 수치를 주장하지 않고 일반화된 백엔드 흐름만
  예로 사용한다.

Inflearn 강의 외의 프로토콜 근거는 IETF의 TCP RFC 9293, UDP RFC 768,
IPv4 PMTUD RFC 1191, IPv6 PMTUD RFC 8201을 우선한다.

## 변경 범위

### 추가

- `src/content/docs/study/cs/network/tcp-ip-layers-and-encapsulation.md`
- `src/content/docs/study/cs/network/tcp-udp-mtu-mss-pmtud.md`
- `src/content/docs/study/cs/network/tcp-connection-lifecycle.md`
- `public/images/study/network/tcp/tcp-ip-layer-stack.svg`
- `public/images/study/network/tcp/tcp-encapsulation-flow.svg`
- `public/images/study/network/tcp/mtu-mss-packet.svg`
- `public/images/study/network/tcp/pmtud-path.svg`
- `public/images/study/network/tcp/tcp-three-way-handshake.svg`
- `public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg`

### 수정

- `src/content/docs/study/cs/network/index.md`
- `src/content/docs/study/cs/network/network-classification.md`
- `tests/study-network-series.test.ts`
- `scripts/verify-build.mjs`
- 필요할 때만 `src/styles/custom.css`

## 테스트와 검증

`tests/study-network-series.test.ts`의 콘텐츠 계약을 기존 3편에서 6편으로
확장한다.

- 허브의 여섯 링크가 정확한 순서와 경로를 가지는지 검증한다.
- 여섯 글의 이전·목록·다음 내비게이션 체인을 검증한다.
- 새 글의 frontmatter, 필수 절, 태그, 공개 날짜, 강의 링크를 검증한다.
- 새 글마다 기술면접 질문이 3개이고 답변이 정확히 세 문장인지 검증한다.
- SVG 파일 6개가 존재하며 글마다 지정된 이미지, `alt`, 캡션이 있는지
  검증한다.
- 5편의 MSS 예시가 조건부 값으로 설명되는지, 6편이 TIME_WAIT 주체를
  클라이언트로 고정하지 않는지 핵심 정확성 계약을 검증한다.

`scripts/verify-build.mjs`에는 새 공개 경로 3개를 추가하고 네트워크 허브의
여섯 링크 순서를 검증한다. 구현 완료 후 다음 명령을 모두 실행한다.

```bash
npm run check
npm test
npm run build
npm run verify:build
```

마지막으로 로컬 빌드를 데스크톱과 모바일 뷰포트에서 열어 여섯 SVG의 글자
크기, 잘림, 대비, 캡션, 본문 흐름을 확인한다.

## 제외 범위

- 혼잡 제어 알고리즘, 흐름 제어 윈도, Nagle 알고리즘은 이번 3편에 포함하지
  않는다.
- 라우팅, ARP, IP 주소 체계, HTTP 버전별 차이는 다음 네트워크 주제의 범위로
  남긴다.
- Wireshark 실제 화면 캡처와 PCAP 다운로드는 균형형 시각 전략의 범위를
  넘어가므로 포함하지 않는다.
- Mermaid 또는 별도 다이어그램 렌더링 라이브러리를 추가하지 않는다.
