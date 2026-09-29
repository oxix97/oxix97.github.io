---
title: CS 지식의 정석 - 네트워크
description: 네트워크의 전달 구조부터 HTTP·브라우저 보안과 장애 판단까지 복습합니다.
slug: study/network
contentType: page
sidebar:
  order: 1
---

Inflearn `CS 지식의 정석` 네트워크 섹션을 복습 질문에 맞춰 20편으로 정리했다.
성능 지표와 전달 경로에서 시작해 HTTP·브라우저 보안·장애 판단으로 이어진다.
각 글을 읽은 뒤에는 핵심 질문에 자료 없이 답하고, 막힌 부분의 흐름과 적용 조건을 다시 확인한다.

## 읽는 순서

1. [대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이](./network-performance-metrics/)
2. [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](./topology-and-bottlenecks/)
3. [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](./network-classification/)
4. [TCP/IP 4계층은 데이터를 어떻게 전달하는가](./tcp-ip-layers-and-encapsulation/)
5. [TCP와 UDP, 그리고 MTU·MSS·PMTUD](./tcp-udp-mtu-mss-pmtud/)
6. [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](./tcp-connection-lifecycle/)
7. [라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블](./routing-and-routing-table/)
8. [IP 주소를 알면 MAC 주소는 어떻게 찾는가: ARP와 RARP](./ip-mac-arp-rarp/)
9. [IPv4와 IPv6 주소는 어떻게 읽는가: 이진수와 주소 표현](./ipv4-ipv6-addressing/)
10. [클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법](./classful-cidr-subnetting-nat/)
11. [HTTP는 버전이 바뀌며 무엇을 해결했는가: 헤더부터 HTTP/3까지](./http-headers-and-versions/)
12. [HTTPS는 어떻게 안전한 연결을 만드는가: TLS 1.3 핸드셰이크](./https-tls-1-3-handshake/)
13. [브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교](./browser-storage-and-cookies/)
14. [로그인 상태는 어디에 저장되는가: 세션 인증과 토큰 인증 비교](./session-vs-token-authentication/)
15. [HTTP 요청은 무엇을 뜻하는가: 메서드·상태 코드·멱등성](./http-methods-status-and-idempotency/)
16. [네트워크 장치와 이더넷: 패킷은 어느 장치를 거치는가](./network-devices-and-ethernet/)
17. [유선 LAN과 Wi-Fi는 전송 매체를 어떻게 공유하는가](./wired-lan-and-wifi/)
18. [트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가](./traffic-overload-and-bottlenecks/)
19. [브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가](./browser-security-boundaries/)
20. [주소 입력부터 화면까지: DNS·연결·요청·렌더링 이어 보기](./url-to-screen/)

마지막 글은 앞선 개념을 하나의 요청 경로로 설명하는 종합 복습이다. 캐시나 기존 연결이 있을 때 어느 단계가 생략되는지도 함께 확인한다.

[CS 학습 영역으로 돌아가기](/study/cs/)
