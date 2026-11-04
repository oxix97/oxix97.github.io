---
title: "15. HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화"
description: HTTP/2의 TCP 스트림과 HTTP/3의 QUIC 스트림이 HOL을 다루는 방식을 비교합니다.
slug: study/network/http-2-and-http-3
contentType: study
publishedAt: 2026-09-29
tags: [Network, HTTP2, HTTP3, QUIC]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 15
---

HTTP/2와 HTTP/3는 같은 HTTP 의미를 서로 다른 연결과 프레임 구조로 전달한다. 두 버전의 멀티플렉싱을 비교하면 HTTP/2가 줄인 대기와 TCP에서 남은 대기를 구분할 수 있다.

## 핵심 요약

- HTTP/2는 바이너리 프레임과 여러 스트림을 사용해 한 TCP 연결을 효율적으로 공유한다.
- HTTP/2는 HTTP 요청 간 대기를 줄여도 TCP 바이트 스트림의 HOL을 없애지 못한다.
- HTTP/3는 QUIC 스트림을 사용해 한 스트림의 손실이 다른 스트림의 전달을 막지 않게 한다.
- 같은 QUIC 스트림 안의 순서 보장과 대기는 그대로 필요하다.

## HTTP/2는 스트림을 프레임으로 나눈다

CSS 응답 A가 끝나기 전에 JavaScript 응답 B를 전송하려면, 수신 측이 각 데이터의 소속을 구분할 수 있어야 한다. HTTP/2는 HTTP 메시지를 바이너리 프레임으로 나누고 스트림 ID를 붙인다. 스트림은 하나의 연결에서 요청과 응답을 주고받는 논리적인 통신 단위다.

서로 다른 스트림의 프레임을 번갈아 보내는 방식을 멀티플렉싱이라고 한다. 하나의 TCP 연결에서 A와 B를 동시에 진행할 수 있다는 뜻이다. 물리적인 회선에서 두 데이터가 같은 순간에 나란히 이동한다는 의미는 아니다.

| HTTP/2 프레임 | 역할 |
| --- | --- |
| `HEADERS` | 압축된 HTTP 필드 등을 전달 |
| `DATA` | 요청·응답 본문 전달 |
| `SETTINGS` | 연결의 동작 설정 전달 |
| `WINDOW_UPDATE` | 수신 가능한 데이터 양을 알려 흐름 제어 |
| `RST_STREAM` | 특정 스트림 중단 |

**HTTP/2는 응답을 스트림별로 구분하지만, TCP는 그 아래의 바이트 순서만 관리한다.**

HTTP/2가 줄인 것은 HTTP 요청·응답 사이의 애플리케이션 계층 HOL이며, TCP 바이트 스트림의 HOL은 남는다. HTTP/1.1 파이프라이닝에서는 앞선 응답이 늦으면 뒤 응답도 기다린다. TCP 세그먼트 하나가 손실되면 뒤에 도착한 바이트가 있어도 손실 복구 뒤까지 애플리케이션에 전달되지 않을 수 있다.

### HTTP 프레임과 실제 패킷을 구분하기

HTTP 메시지가 그대로 하나의 패킷이 되는 것은 아니다. 일반적인 HTTPS에서 HTTP/2는 다음 경로를 거친다.

```text
HTTP/2 HEADERS·DATA 프레임
  → TLS 레코드로 암호화
  → TCP 바이트 스트림
  → TCP 세그먼트 → IP 패킷 → 링크 계층 프레임
```

여기서 HTTP 프레임과 링크 계층 프레임은 계층이 다른 단위다. HTTP/2 프레임 하나가 여러 TCP 세그먼트에 나뉘거나, 세그먼트 하나에 여러 프레임의 데이터가 들어갈 수 있다. TLS 레코드 경계와 TCP 세그먼트 경계도 일치할 필요가 없다.

아래 그림은 앞 글과 같은 A(`/a.css`), B(`/b.js`)를 사용한다. 연결과 TLS 협상, HTTP 헤더 처리가 끝난 상태에서 응답 데이터 전송을 비교한다. **실제 캡처가 아니라, 가능한 패킷 전송 순서를 단순화한 그림이다.** 요청 A·B는 한 화살표로 묶고 ACK, 손실 감지 절차, 암호화 오버헤드는 생략했다. 시간은 위에서 아래로 흐르며, 간격은 실제 소요 시간을 뜻하지 않는다.

### HTTP/1.1: 앞 응답 뒤에 다음 응답을 붙인다

먼저 파이프라이닝으로 A·B를 연속 요청한 경우다. 손실이 없어도 B 응답은 A 응답 전송이 끝나기를 기다린다. 이 단계에서는 HTTP 응답 순서 제약을 본다. TCP 손실이 있다면 아래 HTTP/2 예시와 같은 바이트 순서 대기도 추가된다.

<figure class="study-diagram study-diagram-compact">
  <img src="/images/study/network/http/http-1-1-wire.svg" alt="HTTP/1.1 파이프라이닝에서 A 응답을 모두 전송한 뒤에야 준비된 B 응답을 전송하는 과정" loading="lazy" />
  <figcaption>HTTP/1.1은 서로 다른 응답 본문을 스트림 ID로 구분해 섞어 보낼 수 없다.</figcaption>
</figure>

### HTTP/2: B가 도착해도 TCP가 위로 전달하지 못한다

스트림 A는 1, B는 3으로 표시한다. 각 TCP 세그먼트의 페이로드는 설명을 위해 100바이트로 가정한다. `seq`는 서버→클라이언트 방향의 상대 바이트 번호이며, TLS 등으로 인코딩된 바이트를 센다. A·B 표시는 그 바이트가 담은 HTTP 데이터의 소속을 요약한 것이다.

<figure class="study-diagram study-diagram-compact">
  <img src="/images/study/network/http/http-2-wire.svg" alt="HTTP/2에서 상대 시퀀스 101의 TCP 세그먼트가 손실되면, 201부터 도착한 B 데이터도 수신 버퍼에서 대기하고 101 구간 복구 후 전달되는 과정" loading="lazy" />
  <figcaption>패킷의 도착과 HTTP 계층으로의 전달은 다르다. TCP는 스트림 ID가 아니라 연속된 바이트 구간을 기준으로 전달한다.</figcaption>
</figure>

`seq=101`의 100바이트가 빠지면, `seq=201`부터 받은 B 데이터는 TCP 수신 버퍼에 있어도 위 계층에 전달되지 않는다. 손실 구간이 복구되어야 연속된 바이트를 TLS와 HTTP/2로 넘길 수 있다. 이미 위 계층에 전달된 데이터까지 취소되는 것은 아니다. 따라서 정확한 설명은 “이후 도착한 다른 스트림의 데이터도 전달이 지연될 수 있다”이다.

## HTTP/3는 QUIC 위에서 스트림을 전달한다

HTTP/3는 TCP 대신 QUIC을 사용한다. QUIC은 UDP 위에서 여러 독립 스트림과 연결 상태를 관리한다. 한 스트림의 데이터가 손실되어 재전송을 기다려도 다른 스트림의 순서가 맞는 데이터는 전달될 수 있다.

<figure class="study-diagram">
  <img src="/images/study/network/http/http-version-streams.svg" alt="HTTP/1.1 요청 순서 대기, HTTP/2의 단일 TCP 전송 대기, HTTP/3의 독립 QUIC 스트림을 비교한 그림" loading="lazy" />
  <figcaption>HTTP/2는 TCP 연결을 공유하고 HTTP/3는 QUIC 스트림별로 전달을 독립시킨다.</figcaption>
</figure>

### HTTP/3: 패킷 번호와 스트림 오프셋을 따로 관리한다

HTTP/3의 전송 경로는 다음과 같다. HTTP/3의 `DATA` 프레임과 QUIC의 `STREAM` 프레임은 서로 다른 계층의 단위다.

```text
HTTP/3 HEADERS·DATA 프레임
  → QUIC 스트림의 바이트
  → QUIC STREAM 프레임 → 암호화된 QUIC 패킷
  → UDP 데이터그램 → IP 패킷 → 링크 계층 프레임
```

QUIC의 STREAM 프레임에는 스트림 ID와 오프셋이 있다. 오프셋은 해당 스트림에서 데이터가 들어갈 바이트 위치다. 반면 패킷 번호(PN)는 패킷 수신 여부와 손실을 추적하는 데 쓰인다. 연결 전체의 데이터를 PN 순서대로 애플리케이션에 전달하는 방식은 아니다.

아래에서는 A를 QUIC 스트림 0, B를 4에 배치한다. HTTP/2와 QUIC의 스트림 ID 규칙은 다르다. 각 STREAM 데이터는 100바이트이며 두 스트림 모두 오프셋 1000 앞까지의 데이터와 헤더는 이미 받았다고 가정한다. 그림은 UDP 데이터그램 하나에 QUIC 패킷 하나, 그 안에 STREAM 프레임 하나를 넣은 예시다. 실제로는 한 QUIC 패킷에 여러 스트림의 프레임을 담을 수 있다.

<figure class="study-diagram study-diagram-compact">
  <img src="/images/study/network/http/http-3-wire.svg" alt="HTTP/3에서 패킷 11의 A offset 1100이 손실되어도 패킷 12의 B는 전달된다. A offset 1200은 기다리고 손실 데이터는 새 패킷 번호 14로 복구된다." loading="lazy" />
  <figcaption>B는 A의 빈 구간을 기다리지 않는다. A의 빠진 바이트는 새 패킷 번호로 다시 보내며, 같은 스트림 안에서는 순서를 지킨다.</figcaption>
</figure>

PN 11이 손실되어도 PN 12의 B 데이터는 자신의 스트림에서 순서가 맞으므로 전달할 수 있다. 반면 PN 13의 A 데이터는 오프셋 1100 구간이 비어 있어 기다린다. 복구할 때는 PN 11을 그대로 재사용하지 않고, PN 14의 새 STREAM 프레임에 필요한 데이터를 담아 보낸다.

같은 QUIC 스트림 안의 순서 대기도 사라지지 않는다. 손실된 데이터 뒤의 같은 스트림 데이터는 복구 전까지 기다릴 수 있다. **HTTP/3는 모든 HOL을 없애는 것이 아니라 스트림 사이의 전송 대기를 분리한다.**

QUIC의 독립 스트림이 다른 요청에 대한 모든 영향을 없애지는 않는다. 연결의 혼잡 제어는 공유하므로 손실 때문에 전체 전송 속도가 줄어들 수 있다. 한 패킷에 A와 B 데이터를 함께 넣었다면 둘 다 그 패킷 손실의 영향을 받는다. QPACK 의존성 때문에 헤더 해석이 대기하는 경우도 있다.

### 세 버전의 대기는 어디에서 생기는가

| 비교 기준 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 같은 연결의 HTTP 응답 전송 | 파이프라이닝해도 응답 순서 유지 | 스트림별 프레임 교차 전송 | QUIC 스트림별 교차 전송 |
| 앞 응답 생성 지연 | 뒤 응답 전송도 대기할 수 있음 | 다른 스트림 전송 가능 | 다른 스트림 전송 가능 |
| 전송 중 데이터 손실 | TCP의 이후 바이트 전달 대기 | 같은 TCP 연결의 이후 바이트 전달 대기 | 빈 구간이 있는 스트림의 이후 데이터 전달 대기 |
| 헤더 압축 | 표준 내장 없음 | HPACK | QPACK |
| 전송 기반 | TCP | TCP | QUIC/UDP |

HTTP/2가 바꾼 것은 HTTP 응답을 구분하고 섞어 보내는 방식이다. HTTP/3는 순서 보장 단위까지 연결 전체에서 개별 스트림으로 바꾼다.

## 버전 선택은 환경과 구현을 함께 본다

HTTP/2와 HTTP/3 모두 요청·응답 의미를 유지하고 프레이밍과 전송 계층을 바꾼다. HTTP/3는 QUIC 연결을 쓰므로 TCP 연결과 TLS 절차를 그대로 합쳐 설명하면 안 된다. 서버, 클라이언트, 프록시와 네트워크 환경이 어떤 버전을 협상했는지 실제 연결에서 확인한다.

### HPACK·QPACK과 리소스 우선순위

HPACK은 HTTP/2 필드를 정적 테이블, 동적 테이블, 선택적인 허프만 인코딩으로 압축한다. 정적 테이블은 미리 정해진 항목이고, 동적 테이블은 연결에서 주고받으며 추가한 항목이다. 반복되는 필드를 매번 전체 문자열로 보내는 대신 인덱스 등으로 표현할 수 있다. 본문 압축과는 별개의 기능이다. `Authorization` 같은 민감한 값은 무분별하게 동적 테이블에 넣지 않도록 고려해야 한다.

HTTP/3는 QPACK을 사용한다. 서로 다른 QUIC 스트림이 독립적으로 도착하므로, 필드가 참조하는 동적 테이블 갱신보다 먼저 도착할 수도 있다. QPACK은 이런 의존성과 대기 가능한 스트림 수를 관리한다. 헤더 압축 관련 대기가 전혀 없다는 뜻은 아니다.

우선순위도 처리 순서를 보장하지 않는다. 클라이언트가 CSS를 이미지보다 중요하게 표시해도 실제 스케줄링은 서버 구현과 자원 상태에 달린다. 초기 HTTP/2의 의존성·가중치 방식은 폐기 권고되었으며, RFC 9218은 `Priority` 필드 등을 사용하는 확장 가능한 방식을 정의한다.

### Server Push는 현재 도입할 기능인가

Server Push는 클라이언트가 아직 요청하지 않은 리소스를 서버가 미리 보내는 기능이다. 예를 들어 HTML 응답과 함께 CSS를 보낼 수 있다. 하지만 클라이언트 캐시를 정확히 알기 어렵고, 필요 없는 전송이 발생할 수 있다.

Chrome은 106부터 HTTP/2 Server Push를 기본 비활성화했다. 새 웹 서비스에서 우선 도입할 최적화로 보기는 어렵다. `preload`나 `103 Early Hints`를 검토할 수 있지만, 이들은 브라우저에 가져올 리소스를 알려주는 방식이므로 서버가 본문을 먼저 밀어 보내는 Push와 구분한다.

### 연결 수립은 언제 짧아지는가

RTT는 네트워크 왕복 시간이다. 다음 표는 DNS 조회가 끝났고 손실·Retry·TLS HelloRetryRequest가 없으며 TCP Fast Open도 쓰지 않는 일반적인 새 연결을 비교한다. 응답을 받는 전체 시간 대신, 클라이언트가 보호된 HTTP 요청을 보내기까지의 준비 비용을 본다.

| HTTPS 전송 방식 | 요청을 보내기 전 준비 비용 |
| --- | --- |
| HTTP/1.1 또는 HTTP/2 + TCP + TLS 1.3 | TCP 약 1 RTT + TLS 약 1 RTT |
| HTTP/3 + QUIC의 일반적인 새 연결 | 통합 핸드셰이크 약 1 RTT |
| HTTP/3 + QUIC 0-RTT 재연결 | 서버가 허용하면 첫 전송부터 요청 데이터 포함 가능 |

QUIC은 TLS 1.3의 핸드셰이크로 키를 만들고 자체적으로 패킷을 보호한다. TCP 위 TLS 레코드 계층을 그대로 UDP 위로 옮긴 구조는 아니다. 0-RTT는 이전 연결 정보가 필요하며 서버가 거절할 수 있다. 응답까지 0ms라는 뜻도 아니다. 재생 공격 위험이 있으므로 결제 승인처럼 중복 실행이 위험한 요청을 무조건 조기 전송해서는 안 된다.

Connection ID를 사용하는 QUIC은 Wi-Fi에서 모바일 네트워크로 바뀔 때 연결을 유지할 수 있도록 경로 변경을 지원한다. 다만 경로 검증과 상대 구현의 정책, 새 경로의 도달 가능성 등에 좌우된다.

### Spring Boot 앞에서 연결이 끝날 수도 있다

브라우저와 CDN이 HTTP/3로 통신하더라도 CDN과 애플리케이션 서버 사이까지 같은 버전인 것은 아니다.

```text
브라우저 ── HTTP/3 ── CDN / 로드 밸런서
                         │
                  HTTP/2 또는 HTTP/1.1
                         │
                    Spring Boot API
```

HTTP 연결은 각 구간에서 따로 협상할 수 있다. 브라우저 개발자 도구에 `h3`가 표시된다는 사실만으로 Spring Boot가 QUIC을 직접 처리한다고 판단할 수는 없다. 지연을 분석할 때는 구간별 RTT, 연결 재사용 여부, 협상한 HTTP 버전과 서버 처리 시간을 나누어 확인한다.

## 장점과 한계

HTTP/2는 연결 수를 늘리지 않고 여러 요청을 동시에 전달해 애플리케이션 계층 대기를 줄인다. HTTP/3는 독립 스트림으로 손실이 다른 스트림의 전달까지 막는 현상을 줄인다.

HTTP/2는 TCP 손실 복구의 순서 제약을 공유한다. HTTP/3도 스트림 안에서 순서를 지켜야 하며 UDP 차단, 연결 협상, 구현 지원을 고려해야 한다. 실제 성능은 네트워크 손실과 서버·클라이언트 구현으로 측정한다. 연결을 이미 재사용하고 손실이 적다면 HTTP/3의 이점이 작을 수도 있다.

강의에서 언급한 FEC(Forward Error Correction, 순방향 오류 정정)는 복구용 정보를 미리 보내 손실 데이터를 복원하는 기법이다. 이를 표준 QUIC의 기본 복구 기능으로 설명하면 안 된다. QUIC은 손실을 감지하고 필요한 정보를 새 패킷으로 다시 보낸다. 혼잡 제어와 복구 절차는 RFC 9002에서 별도로 정의한다.

## 기술면접 질문

### HTTP/2가 HTTP/1.1보다 개선한 점은 무엇인가?

바이너리 프레임과 여러 스트림을 사용해 하나의 연결에서 요청과 응답을 멀티플렉싱합니다. 그래서 HTTP/1.1 파이프라이닝의 응답 순서 대기를 줄입니다. 다만 TCP 바이트 스트림의 손실 복구 대기는 남습니다.

### HTTP/2와 HTTP/3의 HOL 차이는 무엇인가?

HTTP/2 스트림은 TCP 연결의 순서 보장을 공유해 세그먼트 손실이 여러 스트림에 영향을 줄 수 있습니다. HTTP/3는 QUIC의 독립 스트림을 사용해 한 스트림의 손실을 다른 스트림과 분리합니다. 각 스트림 내부의 순서 대기는 유지됩니다.

### HTTP/3는 UDP를 사용하므로 신뢰성이 없는가?

아닙니다. HTTP/3는 UDP 위에서 동작하는 QUIC의 연결·재전송·혼잡 제어를 사용합니다. UDP 자체가 제공하는 서비스와 QUIC이 추가하는 신뢰성 기능을 구분해야 합니다.

## 복습 체크리스트

- [ ] HTTP/2의 프레임·스트림·TCP 연결 관계를 설명할 수 있다.
- [ ] HTTP/2에서 TCP HOL이 남는 이유를 설명할 수 있다.
- [ ] QUIC의 스트림 독립성이 HTTP/3의 전달에 주는 효과를 설명할 수 있다.
- [ ] HTTP/3가 스트림 내부의 순서 보장을 없애지 않는 이유를 설명할 수 있다.

## 참고 자료

- [DEEP DIVE : HTTP/2와 HTTP/3의 차이 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=121644)
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9000: QUIC — 스트림·패킷·정보 재전송](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9293: TCP — 순서가 있는 바이트 스트림](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [RFC 9001: Using TLS to Secure QUIC](https://www.rfc-editor.org/rfc/rfc9001.html)
- [RFC 9002: QUIC Loss Detection and Congestion Control](https://www.rfc-editor.org/rfc/rfc9002.html)
- [RFC 7541: HPACK](https://www.rfc-editor.org/rfc/rfc7541.html)
- [RFC 9204: QPACK](https://www.rfc-editor.org/rfc/rfc9204.html)
- [RFC 9218: Extensible Prioritization Scheme for HTTP](https://www.rfc-editor.org/rfc/rfc9218.html)
- [Chrome: Remove HTTP/2 Server Push](https://developer.chrome.com/blog/removing-push)
- [RFC 8297: 103 Early Hints](https://www.rfc-editor.org/rfc/rfc8297.html)

이전: [HTTP 메시지와 HTTP/1.x: 헤더·연결 재사용·HOL](/study/network/http-messages-and-http-1/) · [연재 목록](/study/network/) · 다음: [HTTPS 암호화와 인증서: 기밀성·키 합의·서버 인증](/study/network/https-cryptography-and-certificates/)
