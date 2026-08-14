---
title: "HTTP는 버전이 바뀌며 무엇을 해결했는가: 헤더부터 HTTP/3까지"
description: HTTP 메시지의 필드 구조와 HTTP/1.0부터 HTTP/3까지 연결 재사용, 멀티플렉싱, HOL 문제가 달라진 과정을 정리합니다.
slug: study/network/http-headers-and-versions
contentType: study
publishedAt: 2026-08-14
tags: [Network, HTTP, HTTP2, HTTP3]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 11
---

HTTP 버전을 숫자 순서로만 외우면 각 버전이 왜 연결 방식과 메시지 표현을 바꿨는지 놓치기 쉽다. HTTP 메시지의 구조부터 시작해 연결 재사용, 멀티플렉싱, 전송 계층의 차이를 이어 보면 버전마다 해결한 문제와 남은 한계가 드러난다.

## 핵심 요약

- HTTP/1.1 메시지는 시작줄, 필드, 빈 줄, 선택적인 본문으로 구성된다.
- HTTP/1.0은 기본적으로 응답 뒤 연결을 닫지만 HTTP/1.1은 지속 연결을 기본으로 사용한다.
- HTTP/2는 하나의 TCP 연결에서 여러 스트림을 프레임 단위로 섞어 보낸다. 애플리케이션 계층의 응답 순서 대기는 줄지만 TCP의 HOL은 남는다.
- HTTP/3는 HTTP 의미를 QUIC에 매핑한다. QUIC은 스트림별로 순서를 보장하므로 한 스트림의 손실이 다른 스트림 전체를 막지 않는다.
- HTTP/2와 HTTP/3는 HTTP의 메서드와 상태 코드 의미를 바꾸기보다 전송 표현과 연결 사용 방식을 바꾼다.

## HTTP/1.1 메시지는 어떻게 생겼는가

HTTP는 요청과 응답으로 상호작용하는 애플리케이션 계층 프로토콜이다. HTTP/1.1 요청은 요청줄로 시작하고, 그 아래에 0개 이상의 필드가 이어진다. 빈 줄이 필드 구간의 끝을 알리며, 필요한 경우 그 다음에 본문이 온다.

```http
POST /orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 28

{"productId":42,"count":1}
```

첫 줄은 메서드, 요청 대상, HTTP 버전을 담는다. `Host`, `Content-Type`, `Content-Length`는 `이름: 값` 형태의 필드다. 본문에는 주문을 생성하는 JSON 표현이 들어 있다.

응답은 요청줄 대신 상태줄로 시작한다.

```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 24

{"orderId":101,"ok":true}
```

`Content-Type`은 본문의 미디어 타입을 설명한다. 요청의 `Cookie`나 응답의 `Set-Cookie`처럼 특정 방향에서 주로 사용하는 필드도 있다. 필드는 메타데이터와 제어 정보를 전달하지만, 필드 이름만 보고 요청과 응답을 항상 세 종류의 고정된 묶음으로 나눌 수 있는 것은 아니다.

**HTTP/1.1 메시지에서 빈 줄은 필드 구간의 끝이다. 본문의 존재 여부와 길이는 요청·응답의 의미와 프레이밍 규칙을 함께 보고 판단한다.**

## DevTools의 `General`은 HTTP 헤더 묶음이 아니다

Chrome DevTools의 Network 패널은 한 요청을 `General`, `Response Headers`, `Request Headers` 등으로 나눠 보여 준다. 이 화면은 통신을 조사하기 편하도록 브라우저가 재구성한 보기다.

`General`에는 Request URL, Request Method, Status Code, Remote Address처럼 여러 출처에서 모은 정보가 나온다. 요청 URL과 메서드는 요청 대상과 시작줄에서, 상태 코드는 응답 상태줄에서 온다. Remote Address는 연결 정보다. 따라서 `General`이라는 이름의 별도 필드 블록이 네트워크로 전송되는 것은 아니다.

Request Headers와 Response Headers는 실제 요청·응답 필드를 중심으로 보여 주지만, 브라우저가 표시 형식을 정리하거나 HTTP/2·3의 의사 필드를 별도로 표현할 수 있다. 패킷 수준의 원문과 DevTools 화면이 글자 단위로 항상 같다고 가정하면 안 된다.

## HTTP/1.0에서 HTTP/1.1로 바뀐 연결 방식

HTTP/1.0의 기본 동작에서는 클라이언트가 요청 전에 연결을 만들고 서버가 응답을 보낸 뒤 연결을 닫는다. HTML, CSS, JavaScript를 각각 받는다면 연결 설정을 반복할 수 있다. 일부 구현은 `Connection: keep-alive`로 지속 연결을 협상했지만 표준화와 프록시 호환에 문제가 있었다.

HTTP/1.1은 지속 연결을 기본값으로 바꿨다. 메시지에 `Connection: close`가 없다면 하나의 연결에서 다음 요청과 응답을 이어 갈 수 있다. 연결 설정 횟수는 줄지만, 서버와 클라이언트가 메시지 길이를 정확히 알아야 다음 메시지의 경계를 찾을 수 있다.

HTTP/1.1 요청에는 `Host` 필드도 필요하다. 하나의 IP 주소가 여러 호스트를 서비스할 때 서버는 `Host` 값으로 어느 대상에 대한 요청인지 구분할 수 있다. `Range` 요청은 표현의 일부만 요구할 수 있게 해 중단된 다운로드 재개 같은 기능의 기반이 되지만, 서버가 모든 범위 요청을 반드시 받아들여야 하는 것은 아니다.

### 파이프라이닝과 애플리케이션 계층 HOL

지속 연결이 있다고 해서 요청을 하나씩만 보낼 필요는 없다. HTTP/1.1 파이프라이닝을 지원하는 클라이언트는 앞선 응답을 기다리지 않고 여러 요청을 전송할 수 있다.

서버는 안전한 메서드의 요청을 병렬로 처리할 수 있지만 응답은 요청받은 순서대로 보내야 한다. 첫 번째 응답 생성이 오래 걸리면 뒤에서 준비를 마친 응답도 먼저 전송할 수 없다. RFC 9113은 이를 애플리케이션 계층의 Head-of-Line Blocking으로 설명한다.

브라우저와 서버는 병렬 요청을 위해 여러 TCP 연결을 사용하기도 했다. 요청 대기는 줄어들지만 연결마다 핸드셰이크와 혼잡 제어 상태가 필요하다. HTTP/2는 여러 연결을 늘리는 대신 하나의 연결 안에 독립적인 HTTP 스트림을 둔다.

**HTTP/1.1의 지속 연결은 연결 설정 반복을 줄였지만, 같은 연결의 응답 순서 제약까지 없애지는 않았다.**

## HTTP/2는 하나의 TCP 연결을 여러 스트림으로 나눈다

HTTP/2는 HTTP 메시지를 바이너리 프레임으로 표현한다. 프레임에는 길이, 종류, 플래그, 스트림 식별자 같은 정보가 들어간다. 한 요청과 응답은 같은 스트림을 사용하고, 여러 스트림의 프레임은 하나의 TCP 연결에서 번갈아 전송될 수 있다.

예를 들어 스트림 1의 큰 응답을 모두 보낸 뒤 스트림 3을 시작할 필요가 없다. 서버는 스트림 1의 DATA 프레임 사이에 스트림 3의 HEADERS와 DATA 프레임을 넣을 수 있다. 수신자는 스트림 식별자로 프레임을 다시 조립한다.

필드는 HPACK으로 압축한다. 이전에 보낸 필드 값을 동적 테이블에서 참조해 `User-Agent`나 `Cookie`처럼 반복되는 값을 매번 그대로 보내는 비용을 줄인다. HTTP/2는 스트림과 연결 단위의 흐름 제어도 제공한다.

이 구조는 HTTP/1.1 파이프라이닝의 응답 순서 제약을 없앤다. 하지만 HTTP/2는 여전히 하나의 TCP 바이트 스트림 위에서 동작한다. TCP 세그먼트 하나가 손실되면 TCP는 그 구간이 복구될 때까지 이후 바이트를 애플리케이션에 순서대로 전달할 수 없다. 손실된 세그먼트와 관계없는 HTTP/2 스트림도 같은 TCP 연결을 사용한다면 함께 멈출 수 있다.

**HTTP/2가 줄인 것은 HTTP 요청·응답 사이의 애플리케이션 계층 HOL이며, TCP 바이트 스트림의 HOL은 남는다.**

## HTTP/3는 QUIC 스트림 위에서 HTTP를 전달한다

HTTP/3는 HTTP 의미를 QUIC 전송 프로토콜에 매핑한다. QUIC 패킷은 UDP 데이터그램에 실리지만 QUIC 자체가 연결 설정, 신뢰성 있는 전달, 손실 복구, 혼잡 제어, 스트림 다중화를 제공한다. UDP를 쓴다는 사실이 애플리케이션에서 이 기능을 다시 구현한다는 뜻은 아니다.

각 HTTP 요청과 응답은 하나의 QUIC 스트림을 사용한다. QUIC은 스트림 안에서는 바이트 순서를 보장하지만 서로 다른 스트림 사이의 전달 순서를 강제하지 않는다. 스트림 A의 데이터가 담긴 패킷이 손실돼도 스트림 B의 수신 데이터는 계속 애플리케이션에 전달될 수 있다.

한 QUIC 패킷에 여러 스트림의 데이터가 함께 들어 있었다면 그 패킷을 잃은 스트림들은 모두 복구를 기다린다. 같은 QUIC 스트림 안의 순서 대기도 사라지지 않는다. HTTP/3가 모든 HOL을 제거한다고 표현하면 범위가 지나치게 넓다.

HTTP/3의 필드 압축은 QPACK을 사용한다. HTTP/2의 HPACK은 압축 테이블 갱신 순서에 의존하므로 QUIC의 독립 스트림과 그대로 맞지 않는다. QPACK은 별도의 단방향 스트림으로 동적 테이블 상태를 관리하며 압축 효율과 차단 위험을 조절한다.

QUIC은 TLS 1.3을 전송 계층 설계에 통합한다. 연결 기밀성과 무결성, 상대 인증을 함께 제공하지만 HTTP/3 자체를 전방 오류 수정 기반 프로토콜로 정의하지는 않는다. QUIC v1의 손실 복구는 ACK와 재전송 가능한 정보를 이용한다.

<figure class="study-diagram">
  <img
    src="/images/study/network/http/http-version-streams.svg"
    alt="HTTP/1.1의 순서가 있는 응답, HTTP/2의 단일 TCP 연결 위 멀티플렉싱, HTTP/3의 독립 QUIC 스트림을 비교한 구조도"
    loading="lazy"
  />
  <figcaption>HTTP/2는 HTTP 스트림을 한 TCP 연결에 다중화하고, HTTP/3는 QUIC이 스트림별 순서와 손실 복구 경계를 제공하도록 바꾼다.</figcaption>
</figure>

## HTTP/1.1·2·3 비교

| 비교 기준 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 대표 전송 기반 | TCP | TCP | QUIC over UDP |
| 메시지 표현 | 텍스트 시작줄과 필드줄 | 바이너리 프레임 | QUIC 스트림 위 바이너리 프레임 |
| 요청 다중화 | 파이프라이닝은 가능하지만 응답 순서 유지 | 여러 HTTP 스트림을 한 TCP 연결에 다중화 | 요청마다 독립적인 QUIC 스트림 사용 |
| 필드 압축 | 별도 표준 압축 없음 | HPACK | QPACK |
| HOL 경계 | 앞 응답이 뒤 응답을 막을 수 있음 | HTTP 계층 순서 대기는 줄지만 TCP 손실이 전체 연결에 영향 | 한 스트림의 손실이 다른 스트림 진행을 직접 막지 않음 |
| 보안 연결 | HTTPS에서 별도 TLS 사용 | HTTPS에서 별도 TLS 사용 | QUIC 연결에 TLS 1.3 통합 |

HTTP 버전이 올라가도 메서드, 상태 코드, URI, 필드의 기본 의미는 이어진다. 달라지는 부분은 그 의미를 어떤 프레임에 담고, 한 연결에서 여러 요청을 어떻게 구분하며, 손실의 영향을 어느 범위에 가두는지다.

## 장점과 한계

HTTP/1.1의 지속 연결은 매 요청마다 연결을 다시 만드는 비용을 줄인다. HTTP/2의 바이너리 프레이밍과 멀티플렉싱은 적은 TCP 연결로 여러 요청을 동시에 진행하게 한다. HTTP/3는 스트림 다중화와 손실 복구를 QUIC에 두어 한 스트림의 손실이 다른 스트림까지 멈추는 범위를 줄인다.

버전이 높다고 모든 환경에서 지연이 자동으로 줄어드는 것은 아니다. 서버와 중간 장비의 지원, 왕복 시간, 손실률, 연결 재사용, 요청 크기가 함께 영향을 준다. HTTP/3도 혼잡 제어와 재전송 비용이 있고, 같은 스트림의 순서 대기는 유지한다.

필드 압축에도 상태와 메모리 비용이 든다. 잘못된 메시지 길이 처리나 서로 다른 파서 해석은 요청 스머글링 같은 보안 문제로 이어질 수 있다. 운영에서는 브라우저의 Protocol 열, 서버 로그, 패킷 캡처를 통해 실제 협상된 버전과 연결 재사용 여부를 확인해야 한다.

## 기술면접 질문

### HTTP 헤더와 본문은 어떻게 구분하는가?

HTTP/1.1 메시지는 시작줄 다음에 필드줄이 이어지고 빈 줄이 필드 구간의 끝을 표시합니다. 본문이 있다면 빈 줄 뒤에 오며 `Content-Length`, 전송 코딩, 응답 의미 같은 프레이밍 규칙으로 길이를 판단합니다. DevTools의 `General`은 여러 정보를 모은 화면 구역일 뿐 네트워크로 전송되는 별도 헤더 블록은 아닙니다.

### HTTP/1.1과 HTTP/2의 가장 큰 차이는 무엇인가?

HTTP/1.1은 지속 TCP 연결을 기본으로 사용하지만 파이프라이닝 응답은 요청 순서를 유지해야 합니다. HTTP/2는 메시지를 바이너리 프레임으로 나누고 스트림 식별자를 사용해 하나의 TCP 연결에서 여러 요청과 응답을 다중화합니다. 이 방식은 애플리케이션 계층 HOL을 줄이지만 TCP 세그먼트 손실에 따른 연결 전체의 HOL은 해결하지 못합니다.

### HTTP/2와 HTTP/3의 HOL Blocking은 어떻게 다른가?

HTTP/2의 여러 스트림은 하나의 TCP 바이트 스트림을 공유하므로 손실된 TCP 세그먼트가 복구될 때 전체 연결의 전달이 멈출 수 있습니다. HTTP/3는 QUIC이 스트림별로 순서를 관리해 한 스트림의 손실이 다른 스트림의 진행을 직접 막지 않게 합니다. 다만 같은 QUIC 스트림 안의 순서 대기와 손실 복구 비용까지 없어지는 것은 아닙니다.

## 복습 체크리스트

- [ ] HTTP/1.1 요청과 응답에서 시작줄, 필드, 빈 줄, 본문을 구분할 수 있다.
- [ ] DevTools의 `General` 영역이 실제 HTTP 필드 묶음이 아님을 설명할 수 있다.
- [ ] HTTP/1.0의 기본 연결 종료와 HTTP/1.1의 기본 지속 연결을 구분할 수 있다.
- [ ] 파이프라이닝에서 앞 응답이 뒤 응답을 막는 이유를 설명할 수 있다.
- [ ] HTTP/2 프레임, 스트림, 멀티플렉싱과 HPACK의 역할을 설명할 수 있다.
- [ ] HTTP/2의 애플리케이션 계층 HOL 개선과 TCP HOL 한계를 구분할 수 있다.
- [ ] HTTP/3가 QUIC 스트림과 QPACK을 사용하는 이유를 설명할 수 있다.
- [ ] HTTP/3에서도 같은 스트림의 순서 대기와 손실 복구가 남음을 설명할 수 있다.

## 참고 자료

- [HTTP 헤더(header) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=141046)
- [DEEP DIVE : HTTP/1.0과 HTTP/1.1의 차이와 keep-alive, HOL까지 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116070)
- [DEEP DIVE : HTTP/2와 HTTP/3의 차이 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=121644)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9112: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9204: QPACK: Field Compression for HTTP/3](https://www.rfc-editor.org/rfc/rfc9204)

이전: [클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법](/study/network/classful-cidr-subnetting-nat/) · [연재 목록](/study/network/) · 다음: [HTTPS는 어떻게 안전한 연결을 만드는가: TLS 1.3 핸드셰이크](/study/network/https-tls-1-3-handshake/)
