---
title: "14. HTTP 메시지와 HTTP/1.x: 헤더·연결 재사용·HOL"
description: HTTP 메시지의 구조와 HTTP/1.0·1.1의 연결 처리, 파이프라이닝의 HOL을 정리합니다.
slug: study/network/http-messages-and-http-1
contentType: study
publishedAt: 2026-08-14
tags: [Network, HTTP, HTTP1]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 14
---

HTTP 버전을 숫자로만 외우면 메시지의 경계와 연결 방식이 바뀐 이유를 놓치기 쉽다. 먼저 HTTP/1.1 요청을 읽고, HTTP/1.0과 비교해 지속 연결과 HOL 문제를 구분한다.

## 핵심 요약

- HTTP/1.1 메시지는 시작줄, 필드, 빈 줄, 선택적 본문으로 구성된다.
- HTTP/1.0은 기본적으로 응답 뒤 연결을 닫고, HTTP/1.1은 지속 연결을 기본으로 사용한다.
- HTTP/1.1 파이프라이닝은 요청을 연달아 보내도 응답 순서가 앞 요청에 묶이는 HOL 문제가 있다.
- HTTP/2·3의 멀티플렉싱 차이는 [다음 글](/study/network/http-2-and-http-3/)에서 이어서 살핀다.

## HTTP/1.1 메시지는 어떻게 생겼는가

HTTP/1.1 요청은 요청줄 다음에 필드가 오고, 빈 줄 뒤에 필요한 경우 본문이 온다. 응답은 요청줄 대신 상태줄을 사용한다.

```http
POST /orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 28

{"productId":42,"count":1}
```

요청줄은 메서드, 요청 대상, HTTP 버전을 표현한다. 그 다음 필드는 메시지를 설명하고, 빈 줄은 필드 영역이 끝났다는 표시다. 본문은 리소스 표현이나 요청 데이터를 담을 수 있다.

## HTTP/1.0과 HTTP/1.1은 연결을 다르게 사용한다

초기 HTTP/1.0의 기본 동작은 요청마다 TCP 연결을 만들고 응답 뒤 닫는 방식이었다. HTML, CSS, JavaScript를 각각 받는다면 연결 설정 비용이 반복될 수 있다. 일부 구현은 Keep-Alive 확장으로 연결을 재사용했으므로, HTTP/1.0에서는 재사용이 불가능했다고 단정하면 안 된다.

TCP 연결을 새로 만들 때는 `SYN → SYN+ACK → ACK`의 3-Way Handshake를 거친다. RTT(Round Trip Time)는 두 호스트 사이의 왕복 시간이다. 일반적인 TCP 연결에서는 클라이언트가 SYN을 보낸 뒤 SYN+ACK을 받기까지 약 1 RTT가 걸린다. 마지막 ACK와 함께 요청 데이터를 보낼 수도 있다. HTTPS라면 TLS 협상 비용도 따로 고려해야 한다.

HTTP/1.1은 지속 연결을 기본으로 두어 여러 요청에 한 연결을 재사용할 수 있다. 파이프라이닝을 사용하면 클라이언트가 앞 응답을 기다리지 않고 요청을 연달아 보낼 수 있지만, 서버 응답은 요청 순서대로 전달해야 한다. 앞 응답이 늦으면 뒤 응답도 기다리는 애플리케이션 계층 HOL이 남는다.

**지속 연결은 연결 비용을 줄이고, 파이프라이닝은 응답 순서 제약을 없애지 못한다.**

HTTP/1.1에서 `Connection: keep-alive`는 연결 재사용을 위해 필수로 넣어야 하는 헤더가 아니다. 지속 연결이 기본이며, 연결을 닫겠다는 의사는 `Connection: close`로 표현할 수 있다. 서버의 유휴 타임아웃이나 네트워크 문제로 연결이 먼저 닫힐 수 있으므로 영구적인 연결을 보장하지는 않는다.

### 한 TCP 연결에서 응답은 어떤 순서로 전송되는가

클라이언트가 `/a.css`와 `/b.js`를 요청한다고 하자. 그림에서는 두 요청을 A와 B로 줄여 쓴다. A 응답은 크거나 생성이 느리고, B는 먼저 준비된 상황이다. 비교를 위해 HTTP/1.1 파이프라이닝을 사용한다. 실제 브라우저의 일반적인 기본 동작을 그대로 재현한 그림은 아니다.

<figure class="study-diagram study-diagram-compact">
  <img src="/images/study/network/http/http-1-1-wire.svg" alt="위에서 아래로 시간이 흐르는 HTTP/1.1 전송 예시. GET A와 GET B를 연속 전송해도 B는 응답 A 전송이 끝난 뒤 전달된다." loading="lazy" />
  <figcaption>한 지속 TCP 연결의 예시다. 요청 두 개는 화살표 하나로 묶었고, 응답 화살표는 TCP 세그먼트에 실린 데이터의 예시다.</figcaption>
</figure>

B가 먼저 준비되어도 서버는 A 응답의 나머지 사이에 B 응답을 끼워 넣을 수 없다. HTTP/1.1에는 이를 서로 다른 스트림으로 구분해 재조립하는 장치가 없기 때문이다. 파이프라이닝 없이 순차 요청하면 B 요청 자체가 A 응답 뒤에 나간다. 여러 TCP 연결을 사용하면 이 대기를 분산할 수 있지만 연결 관리 비용이 늘어난다.

여기에 패킷 손실이 발생하면 TCP의 순서 보장에 따른 대기도 생긴다. 이 대기와 HTTP 응답 순서 대기는 구분해야 한다. [다음 글의 패킷 비교](/study/network/http-2-and-http-3/#http2는-스트림을-프레임으로-나눈다)에서 두 계층의 차이를 살펴본다.

### Host와 Range는 어떤 문제를 해결하는가

`Host`는 같은 IP 주소로 들어온 요청이 어느 호스트를 대상으로 하는지 구분한다. HTTP/1.1 요청에는 필수이며, 서버는 이 값을 가상 호스트 선택 등에 사용할 수 있다.

```http
GET / HTTP/1.1
Host: shop.example.com
```

`Range`는 리소스의 일부 구간을 요청한다. 다음 요청의 바이트 위치는 0부터 세므로, 처음 1,000,000바이트를 받은 뒤 이어받는 예시다.

```http
GET /video.mp4 HTTP/1.1
Host: example.com
Range: bytes=1000000-
```

서버가 범위 요청을 처리하면 `206 Partial Content`와 `Content-Range`로 응답할 수 있다. 범위를 무시하고 전체 표현을 `200 OK`로 보내거나, 범위를 만족할 수 없어 `416 Range Not Satisfiable`을 보낼 수도 있다. 이어받기 중 파일이 바뀔 가능성이 있다면 `If-Range` 같은 검증 조건도 고려한다.

## 메시지 의미와 전송 방식은 별개의 층위다

HTTP 메서드와 상태 코드의 의미는 버전마다 새로 정의되는 것이 아니다. 버전은 메시지 표현과 연결 사용 방식을 발전시켰다. 요청의 의미는 [HTTP 메서드와 멱등성 글](/study/network/http-methods-status-and-idempotency/)에서, HTTP/2·3의 스트림과 HOL은 [다음 글](/study/network/http-2-and-http-3/)에서 비교한다.

### 요청 수와 전송 바이트를 줄이는 방법

연결 재사용과 별개로, 페이지에 필요한 요청 수와 전송 바이트도 성능에 영향을 준다.

| 방법 | 줄이는 대상 | 적용할 때의 비용 |
| --- | --- | --- |
| 이미지 스프라이트 | 여러 아이콘을 가져오는 요청 수 | 개별 이미지 교체와 캐싱이 어려워질 수 있다 |
| Minification | 소스의 공백·주석 등 불필요한 바이트 | 원본으로 디버깅하려면 소스 맵 등을 고려한다 |
| Base64 데이터 URL | HTML·CSS에 넣은 이미지의 별도 요청 | 인코딩 결과는 압축 전 기준으로 대략 33% 커진다 |

Minification은 네트워크의 RTT 자체를 줄이는 기술이 아니다. gzip·Brotli 같은 전송 압축과도 다른 단계다. Base64 크기는 입력 길이에 따라 패딩이 추가되므로 작은 데이터에서는 증가율이 더 클 수 있다. HTTP/2 이상에서도 전송량 절감은 유효하지만, 요청 수 감소만으로 묶음 파일이 항상 유리하다고 판단해서는 안 된다.

## 장점과 한계

HTTP/1.1 지속 연결은 매 요청마다 TCP 연결을 새로 만드는 비용을 줄인다. 텍스트 기반 시작줄과 필드 구조는 메시지 형식을 살펴보기 쉽다. 다만 HTTPS 패킷의 HTTP 내용은 암호화되므로 복호화 정보 없이 그대로 읽을 수는 없다.

여러 요청을 한 연결에서 다룰 때 응답 순서와 TCP 바이트 스트림이 병목이 될 수 있다. 파이프라이닝은 서버와 클라이언트 지원 차이로 널리 쓰이지 않았으며 이후 버전은 전송 표현과 스트림 처리 방식을 발전시켰다.

## 기술면접 질문

### HTTP/1.1 요청에서 헤더와 본문은 어떻게 구분하는가?

시작줄 뒤의 필드와 본문은 빈 줄로 구분합니다. 요청줄에는 메서드와 요청 대상, 버전이 오고 필드는 메시지의 속성을 전달합니다. 본문이 없는 요청도 가능하며 본문의 해석은 메서드와 필드에 따라 달라집니다.

### HTTP/1.0과 HTTP/1.1의 연결 처리 차이는 무엇인가?

HTTP/1.0의 기본 동작은 응답 뒤 연결을 닫는 것이고 HTTP/1.1은 지속 연결을 기본으로 사용합니다. 연결 재사용은 TCP 연결 설정 비용을 줄입니다. 요청과 응답 순서에 따른 대기는 별도로 남을 수 있습니다.

### HTTP/1.1 파이프라이닝의 HOL은 무엇인가?

요청을 연속해서 보내도 응답을 요청 순서대로 전달해야 해서 앞 응답이 늦으면 뒤 응답도 기다립니다. 이 현상을 파이프라이닝의 HOL이라고 부릅니다. HTTP/2와 HTTP/3는 스트림을 나누는 방식으로 애플리케이션 계층의 대기를 줄이지만 각 전송 계층의 한계는 따로 살펴야 합니다.

## 복습 체크리스트

- [ ] HTTP/1.1 메시지의 시작줄·필드·빈 줄·본문을 구분할 수 있다.
- [ ] HTTP/1.0과 HTTP/1.1의 지속 연결 차이를 설명할 수 있다.
- [ ] 파이프라이닝에서도 응답 순서에 따른 HOL이 남는 이유를 설명할 수 있다.
- [ ] HTTP 메시지 의미와 전송 버전의 차이를 구분할 수 있다.

## 참고 자료

- [HTTP 헤더(header) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=141046)
- [DEEP DIVE : HTTP/1.0과 HTTP/1.1의 차이와 keep-alive, HOL까지 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116070)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9112: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9293: TCP — 연결 수립과 바이트 순서](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 4648 §4: Base64 인코딩](https://www.rfc-editor.org/rfc/rfc4648.html#section-4)

이전: [클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법](/study/network/classful-cidr-subnetting-nat/) · [연재 목록](/study/network/) · 다음: [HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화](/study/network/http-2-and-http-3/)
