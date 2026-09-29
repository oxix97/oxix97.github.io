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

초기 HTTP/1.0 동작은 요청마다 TCP 연결을 만들고 응답 뒤 닫는 방식이었다. 페이지에 이미지가 여럿 있으면 연결 설정이 반복될 수 있다.

HTTP/1.1은 지속 연결을 기본으로 두어 여러 요청에 한 연결을 재사용할 수 있다. 파이프라이닝을 사용하면 클라이언트가 앞 응답을 기다리지 않고 요청을 연달아 보낼 수 있지만, 서버 응답은 요청 순서대로 전달해야 한다. 앞 응답이 늦으면 뒤 응답도 기다리는 애플리케이션 계층 HOL이 남는다.

**지속 연결은 연결 비용을 줄이고, 파이프라이닝은 응답 순서 제약을 없애지 못한다.**

## 메시지 의미와 전송 방식은 별개의 층위다

HTTP 메서드와 상태 코드의 의미는 버전마다 새로 정의되는 것이 아니다. 버전은 메시지 표현과 연결 사용 방식을 발전시켰다. 요청의 의미는 [HTTP 메서드와 멱등성 글](/study/network/http-methods-status-and-idempotency/)에서, HTTP/2·3의 스트림과 HOL은 [다음 글](/study/network/http-2-and-http-3/)에서 비교한다.

## 장점과 한계

HTTP/1.1 지속 연결은 매 요청마다 TCP 연결을 새로 만드는 비용을 줄인다. 텍스트 기반 시작줄과 필드 구조는 사람이 패킷을 읽기 쉽다.

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

이전: [클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법](/study/network/classful-cidr-subnetting-nat/) · [연재 목록](/study/network/) · 다음: [HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화](/study/network/http-2-and-http-3/)
