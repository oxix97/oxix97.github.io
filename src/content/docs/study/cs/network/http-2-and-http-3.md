---
title: "HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화"
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

HTTP/2는 HTTP 메시지를 바이너리 프레임으로 나누고, 하나의 TCP 연결 위에 여러 스트림을 만든다. 서로 다른 스트림의 프레임을 번갈아 보내 여러 요청과 응답을 동시에 진행할 수 있다.

HTTP/2가 줄인 것은 HTTP 요청·응답 사이의 애플리케이션 계층 HOL이며, TCP 바이트 스트림의 HOL은 남는다. HTTP/1.1 파이프라이닝에서는 앞선 응답이 늦으면 뒤 응답도 기다린다. TCP 세그먼트 하나가 손실되면 뒤에 도착한 바이트가 있어도 손실 복구 뒤까지 애플리케이션에 전달되지 않을 수 있다.

## HTTP/3는 QUIC 위에서 스트림을 전달한다

HTTP/3는 TCP 대신 QUIC을 사용한다. QUIC은 UDP 위에서 여러 독립 스트림과 연결 상태를 관리한다. 한 스트림의 데이터가 손실되어 재전송을 기다려도 다른 스트림의 순서가 맞는 데이터는 전달될 수 있다.

<figure class="study-diagram">
  <img src="/images/study/network/http/http-version-streams.svg" alt="HTTP/1.1 요청 순서 대기, HTTP/2의 단일 TCP 전송 대기, HTTP/3의 독립 QUIC 스트림을 비교한 그림" loading="lazy" />
  <figcaption>HTTP/2는 TCP 연결을 공유하고 HTTP/3는 QUIC 스트림별로 전달을 독립시킨다.</figcaption>
</figure>

같은 QUIC 스트림 안의 순서 대기도 사라지지 않는다. 손실된 데이터 뒤의 같은 스트림 데이터는 복구 전까지 기다릴 수 있다. **HTTP/3는 모든 HOL을 없애는 것이 아니라 스트림 사이의 전송 대기를 분리한다.**

## 버전 선택은 환경과 구현을 함께 본다

HTTP/2와 HTTP/3 모두 요청·응답 의미를 유지하고 프레이밍과 전송 계층을 바꾼다. HTTP/3는 QUIC 연결을 쓰므로 TCP 연결과 TLS 절차를 그대로 합쳐 설명하면 안 된다. 서버, 클라이언트, 프록시와 네트워크 환경이 어떤 버전을 협상했는지 실제 연결에서 확인한다.

## 장점과 한계

HTTP/2는 연결 수를 늘리지 않고 여러 요청을 동시에 전달해 애플리케이션 계층 대기를 줄인다. HTTP/3는 독립 스트림으로 손실이 다른 스트림의 전달까지 막는 현상을 줄인다.

HTTP/2는 TCP 손실 복구의 순서 제약을 공유한다. HTTP/3도 스트림 안에서 순서를 지켜야 하며 UDP 차단, 연결 협상, 구현 지원을 고려해야 한다. 실제 성능은 네트워크 손실과 서버·클라이언트 구현으로 측정한다.

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
- [RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000)

이전: [HTTP 메시지와 HTTP/1.x: 헤더·연결 재사용·HOL](/study/network/http-messages-and-http-1/) · [연재 목록](/study/network/) · 다음: [HTTPS 암호화와 인증서: 기밀성·키 합의·서버 인증](/study/network/https-cryptography-and-certificates/)
