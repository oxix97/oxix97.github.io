---
title: CS 지식의 정석 - 네트워크
description: 네트워크 전달 구조부터 HTTP·브라우저와 장애 판단까지 25편으로 복습합니다.
slug: study/network
contentType: page
sidebar:
  order: 1
---

Inflearn `CS 지식의 정석` 네트워크 섹션을 핵심 질문에 따라 25편으로 정리했다. 성능 지표와 전달 경로에서 시작해 HTTP·브라우저 보안·장애 판단으로 이어진다.
각 글을 읽은 뒤에는 핵심 질문에 자료 없이 답하고, 막힌 부분의 흐름과 적용 조건을 다시 확인한다.

## 읽는 순서

1. [대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이](./network-performance-metrics/)
2. [연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석](./topology-and-bottlenecks/)
3. [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](./network-classification/)
4. [TCP/IP 4계층은 데이터를 어떻게 전달하는가](./tcp-ip-layers-and-encapsulation/)
5. [TCP와 UDP는 오류를 어떻게 다루는가: 신뢰성·체크섬·CRC](./tcp-udp-checksums-crc/)
6. [MTU·MSS·PMTUD와 네이글 알고리즘](./mtu-mss-pmtud-nagle/)
7. [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](./tcp-connection-lifecycle/)
8. [라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블](./routing-and-routing-table/)
9. [IP 주소를 알면 MAC 주소는 어떻게 찾는가: ARP와 RARP](./ip-mac-arp-rarp/)
10. [네트워크 장치와 이더넷: 패킷은 어느 장치를 거치는가](./network-devices-and-ethernet/)
11. [유선 LAN과 Wi-Fi는 전송 매체를 어떻게 공유하는가](./wired-lan-and-wifi/)
12. [IPv4와 IPv6 주소는 어떻게 읽는가: 이진수와 주소 표현](./ipv4-ipv6-addressing/)
13. [클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법](./classful-cidr-subnetting-nat/)
14. [HTTP 메시지와 HTTP/1.x: 헤더·연결 재사용·HOL](./http-messages-and-http-1/)
15. [HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화](./http-2-and-http-3/)
16. [HTTPS 암호화와 인증서: 기밀성·키 합의·서버 인증](./https-cryptography-and-certificates/)
17. [TLS 1.3 핸드셰이크는 연결 키를 어떻게 만드는가](./https-tls-1-3-handshake/)
18. [브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교](./browser-storage-and-cookies/)
19. [로그인 상태는 어디에 저장되는가: 세션 인증과 토큰 인증 비교](./session-vs-token-authentication/)
20. [HTTP 요청은 무엇을 뜻하는가: 메서드·상태 코드·멱등성](./http-methods-status-and-idempotency/)
21. [REST API는 리소스를 어떻게 표현하고 연결하는가](./rest-api/)
22. [트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가](./traffic-overload-and-bottlenecks/)
23. [브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가](./browser-security-boundaries/)
24. [브라우저 렌더링: HTML에서 화면까지](./browser-rendering/)
25. [주소 입력부터 화면까지: DNS·연결·요청·렌더링 이어 보기](./url-to-screen/)

마지막 글은 앞선 개념을 하나의 요청 경로로 연결하는 종합 복습이다. DNS·HTTP 캐시와 기존 연결이 있을 때 생략되거나 달라지는 단계도 함께 확인한다.

[CS 학습 영역으로 돌아가기](/study/cs/)
