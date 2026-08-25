---
title: CS 지식의 정석 - 네트워크
description: 네트워크 성능, 연결 구조, 분류 기준을 백엔드 관점에서 복습하고 기술면접 답변으로 연결합니다.
slug: study/network
contentType: page
sidebar:
  order: 1
---

Inflearn `CS 지식의 정석` 네트워크 섹션을 강의 흐름에 맞춰 14편으로 정리했다.
성능 지표·토폴로지·분류 기준에서 시작해 TCP/IP 계층과 전송 프로토콜, 라우팅과 IP 주소 체계, HTTP와 TLS, 브라우저 저장소와 로그인 인증으로 이어진다.
각 글에서는 개념의 차이와 적용 범위를 구분하고, 장애·성능 판단에 필요한 기준을 함께 살핀다.

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

[CS 학습 영역으로 돌아가기](/study/cs/)
