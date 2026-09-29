---
title: "주소 입력부터 화면까지: DNS·연결·요청·렌더링 이어 보기"
description: URL 입력 뒤 이름 확인, 경로 선택, 연결, HTTP 응답, 화면 표시를 하나의 조건부 흐름으로 복습합니다.
slug: study/network/url-to-screen
contentType: study
publishedAt: 2026-09-29
tags: [Network, DNS, HTTP, Browser]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 20
---

주소창에 URL을 입력한 뒤 화면이 뜰 때까지를 한 문장으로 설명하기는 어렵다. DNS, 라우팅, 연결, HTTP, 렌더링이 서로 다른 단계이기 때문이다. 이 글은 앞선 네트워크 글을 덮고 흐름을 다시 설명해 보는 종합 복습 자료다.

## 핵심 요약

- 브라우저는 URL과 현재 상태를 해석하고, 필요한 경우 DNS로 호스트 이름의 주소를 확인한다.
- 연결이 새로 필요하다면 경로와 다음 홉을 거쳐 TCP·TLS 또는 QUIC 연결을 설정한다.
- HTTP 요청과 응답 뒤 HTML·CSS·JavaScript 처리 및 추가 리소스 요청을 거쳐 화면을 그린다.
- 캐시, 기존 연결, 리다이렉트, 서비스 워커, 프로토콜 선택 때문에 모든 방문이 같은 순서를 밟지는 않는다.

## 한 번의 새 방문을 기준으로 따라가기

다음 예시는 캐시된 문서나 재사용 가능한 연결이 없는 HTTPS 방문을 가정한다. 브라우저가 실제로 선택하는 세부 경로는 환경에 따라 달라진다.

```text
URL 해석
  → 필요하면 DNS로 호스트의 주소 확인
  → 라우팅과 다음 홉 결정, 링크에서 프레임 전달
  → 새 연결 설정: TCP와 TLS 또는 HTTP/3용 QUIC
  → HTTP 요청 전송, 응답 헤더와 본문 수신
  → HTML 파싱, 추가 리소스 요청, 스타일 계산·레이아웃·그리기
```

DNS 리졸버는 캐시에서 답할 수도 있고 이름 서버에 질의할 수도 있다. DNS는 호스트 이름을 주소와 연결하지만, 요청할 최종 서버 인스턴스나 이후 연결의 성공까지 보장하지 않는다. 주소를 얻은 뒤 호스트는 [라우팅 테이블](/study/network/routing-and-routing-table/)로 다음 홉을 고른다. 같은 링크에서 [ARP와 MAC 주소](/study/network/ip-mac-arp-rarp/)가 필요한 상황도 있다. IPv6에서는 이더넷 IPv4 ARP와 다른 이웃 발견 절차를 사용한다.

연결 단계에서는 프로토콜을 구분한다. HTTP/1.1과 HTTP/2를 TCP 위에서 HTTPS로 사용한다면 TCP 연결과 TLS 협상이 필요하다. HTTP/3는 QUIC을 사용한다. [HTTP 버전 글](/study/network/http-headers-and-versions/)과 [TLS 1.3 글](/study/network/https-tls-1-3-handshake/)에서 각각 전송 방식과 서버 인증·키 설정을 확인할 수 있다. **DNS 조회, TCP 핸드셰이크, TLS 핸드셰이크를 하나의 왕복 과정으로 합치지 않는다.**

## 응답을 받은 뒤 화면이 나오는 과정

서버는 요청의 메서드와 경로에 맞는 응답 상태, 필드, 본문을 보낸다. [HTTP 요청 의미 글](/study/network/http-methods-status-and-idempotency/)에서 읽은 상태 코드가 여기서 처리 결과를 알려 준다. 응답이 리다이렉트라면 브라우저는 위치를 바꿔 새 요청을 만들 수 있다.

HTML을 받기 시작하면 브라우저가 문서를 파싱해 DOM을 만들고, 스타일 자료로 CSSOM을 구성한다. 필요한 스크립트와 이미지 등의 추가 요청도 시작된다. 렌더 트리, 레이아웃, 그리기 단계가 화면 표시로 이어진다. 스크립트와 스타일의 로딩 방식은 파싱과 첫 표시 시점에 영향을 줄 수 있다. 첫 화면이 보인 뒤에도 추가 리소스와 스크립트 처리는 계속될 수 있다.

| 증상 | 먼저 구분할 단계 | 확인 예시 |
| --- | --- | --- |
| 호스트 이름을 찾지 못함 | DNS | 리졸버 응답과 캐시 상태 |
| 이름은 찾았지만 연결 실패 | 경로·연결 | 다음 홉, 포트, TCP 또는 QUIC 연결 |
| 연결은 됐지만 인증서 경고 | TLS | 이름·신뢰 체인·유효 기간 |
| 응답이 늦음 | 서버·전송 | TTFB, 서버 처리, 재전송과 대기 |
| HTML은 왔지만 화면이 늦음 | 리소스·렌더링 | 차단 리소스, 스크립트, 스타일·레이아웃 |

## 생략되거나 달라지는 단계

DNS 답이 캐시에 있고 기존 연결을 재사용한다면 새 DNS 질의와 연결 설정이 보이지 않을 수 있다. HTTP 캐시나 서비스 워커가 응답을 제공할 수도 있다. 리다이렉트는 요청을 추가하고, 리소스마다 다른 호스트의 DNS와 연결이 필요할 수 있다. 따라서 위 화살표는 가능한 대표 경로이지 모든 탐색에서 반드시 실행되는 고정 절차가 아니다.

복습할 때는 “새 방문·캐시 없음·새 연결”을 먼저 가정하고 설명한 뒤, 캐시와 재사용 조건을 하나씩 넣어 어떤 단계가 사라지는지 말해 본다. 마지막으로 위 표의 증상 하나를 골라 확인 순서를 설명하면 개념을 장애 판단에 연결할 수 있다.

## 장점과 한계

단계를 연결해 두면 네트워크 문제와 브라우저 렌더링 문제를 같은 ‘페이지가 느림’으로 뭉뚱그리지 않게 된다. 앞선 개별 글을 실제 요청 경로 안에서 다시 떠올리는 데도 도움이 된다.

다만 브라우저와 CDN, 프록시, 서비스 워커의 구성은 다양하다. 실제 장애에서는 개발자 도구의 네트워크 타이밍, 서버 로그와 경로 측정을 사용해 어느 단계가 실행됐는지 확인해야 한다.

## 기술면접 질문

### URL을 입력한 뒤 화면이 나올 때까지 설명해 주세요.

URL을 해석하고 필요한 경우 DNS로 주소를 확인합니다. 새 연결이 필요하면 경로를 따라 TCP·TLS 또는 QUIC 연결을 준비한 뒤 HTTP 요청과 응답을 주고받습니다. 브라우저는 HTML과 추가 리소스를 처리해 DOM·스타일·레이아웃을 만들고 화면을 그립니다.

### DNS 조회는 매번 일어나는가?

그렇지 않습니다. 리졸버나 브라우저 등의 캐시에 유효한 답이 있으면 새 이름 서버 질의가 생략될 수 있습니다. DNS 답을 얻더라도 이후 라우팅, 연결과 서버 응답은 별도로 확인해야 합니다.

### HTML 응답이 빨라도 화면 표시가 늦을 수 있는가?

그럴 수 있습니다. HTML 파싱 뒤 스타일, 스크립트, 이미지 같은 추가 리소스가 필요하고, 스크립트 실행과 스타일 계산·레이아웃·그리기에도 시간이 듭니다. 네트워크 타이밍과 렌더링 작업을 나눠 조사해야 합니다.

## 복습 체크리스트

- [ ] 새 HTTPS 방문을 가정해 DNS부터 화면 표시까지 순서대로 설명할 수 있다.
- [ ] TCP·TLS 연결과 HTTP/3의 QUIC 경로를 구분할 수 있다.
- [ ] 캐시와 기존 연결이 있을 때 생략될 수 있는 단계를 말할 수 있다.
- [ ] 연결 실패, 느린 응답, 느린 렌더링의 조사 시작점을 각각 고를 수 있다.

## 참고 자료

- [주소 입력 뒤 과정과 DNS ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116069)
- [브라우저 렌더링 과정 ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116074)
- [RFC 1034: Domain Names — Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034)
- [MDN: How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)
- [MDN: Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)

이전: [브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가](/study/network/browser-security-boundaries/) · [연재 목록](/study/network/)
