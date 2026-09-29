---
title: "06. MTU·MSS·PMTUD와 네이글 알고리즘"
description: 패킷 크기 한도와 경로 탐색, 작은 TCP 쓰기를 모으는 네이글 알고리즘을 정리합니다.
slug: study/network/mtu-mss-pmtud-nagle
contentType: study
publishedAt: 2026-09-29
tags: [Network, MTU, MSS, PMTUD]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 6
---

작은 요청은 되는데 큰 응답만 멈추거나, 짧은 메시지의 응답이 늦을 때는 전송 크기와 전송 시점을 따로 살펴야 한다. MTU·MSS·PMTUD와 네이글 알고리즘은 이 두 문제를 구분하게 해 준다.

## 핵심 요약

- MTU는 링크에서 전달할 수 있는 IP 패킷 크기의 상한이고, MSS는 TCP 데이터 크기의 상한이다.
- PMTUD는 목적지까지 경로에서 사용할 패킷 크기를 찾는다. ICMP가 차단되면 큰 패킷만 멈출 수 있다.
- 네이글 알고리즘은 확인되지 않은 데이터가 있을 때 작은 TCP 쓰기를 모아 작은 세그먼트 수를 줄인다.
- 패킷 크기를 줄이는 문제와 전송을 잠시 모으는 문제는 서로 다른 계층의 판단이다.

## MTU와 MSS는 서로 다른 범위를 센다

MTU는 한 링크에서 보낼 수 있는 IP 패킷 전체의 최대 크기다. IP 헤더와 TCP 헤더, 데이터가 포함된다. 반면 TCP의 MSS는 TCP 데이터 옥텟의 최대 크기를 나타내며 연결 설정 중 상대에게 광고한다.

일반적인 Ethernet IP MTU 1500바이트, IPv4 헤더 20바이트, TCP 헤더 20바이트라는 조건이라면 TCP 데이터는 최대 1460바이트다. IPv6 기본 헤더를 가정하면 1440바이트다. 헤더 옵션이나 터널 오버헤드, 더 작은 경로 MTU가 있으면 실제 TCP 데이터는 더 작아진다.

**MTU는 IP 패킷 전체의 한도이고, MSS는 TCP 데이터의 한도다.**

<figure class="study-diagram">
  <img src="/images/study/network/tcp/mtu-mss-packet.svg" alt="1500바이트 IP MTU에서 IPv4 헤더 20바이트, TCP 헤더 20바이트, TCP 데이터 1460바이트를 구분한 그림" loading="lazy" />
  <figcaption>1500·20·20·1460바이트는 옵션이 없는 IPv4와 TCP 헤더를 가정한 예시다.</figcaption>
</figure>

## PMTUD는 경로에서 보낼 크기를 찾는다

경로 MTU는 목적지까지 경로에 놓인 링크 MTU 중 가장 작은 값이다. 송신 호스트가 한 링크에는 맞지만 다음 링크에는 너무 큰 패킷을 보내면 IP 버전과 설정에 따라 단편화되거나 폐기된다.

IPv4의 고전적 PMTUD는 DF를 설정한 패킷을 보내고, 너무 큰 패킷을 전달할 수 없는 라우터가 돌려보내는 ICMP 오류를 사용한다. IPv6 라우터는 패킷을 단편화하지 않고 ICMPv6 Packet Too Big을 돌려보낸다. 송신자는 피드백을 이용해 추정 크기를 낮춘다.

ICMP가 방화벽에서 차단되면 송신자가 크기를 낮출 신호를 받지 못해 연결은 살아 있지만 큰 전송이 멈춘 것처럼 보일 수 있다. 작은 요청은 되고 큰 응답만 정체된다면 패킷 캡처와 장비 로그에서 ICMP, 재전송, 터널 오버헤드를 확인한다. PLPMTUD는 ICMP에만 의존하지 않고 전송 계층의 프로브와 확인으로 크기를 탐색한다.

<figure class="study-diagram">
  <img src="/images/study/network/tcp/pmtud-path.svg" alt="큰 패킷이 MTU가 작은 링크에서 폐기되고 ICMP 피드백 후 송신자가 작은 크기로 다시 보내는 PMTUD 흐름" loading="lazy" />
  <figcaption>경로에서 너무 큰 패킷이 폐기된 뒤 피드백을 받아 송신 크기를 조정한다.</figcaption>
</figure>

## 작은 TCP 쓰기를 모으는 네이글 알고리즘

애플리케이션이 작은 데이터를 자주 쓰면 전송 데이터보다 헤더가 더 큰 세그먼트가 반복될 수 있다. 네이글 알고리즘은 확인되지 않은 데이터가 전송 중일 때 새로 생긴 작은 데이터를 모아 ACK가 도착하거나 충분한 크기가 될 때 보낸다.

이 방식은 작은 세그먼트 수를 줄이지만 대화형 메시지의 전송을 지연시킬 수 있다. 특히 애플리케이션의 쓰기 방식과 상대의 지연 ACK가 맞물리면 체감 지연이 커질 수 있다. 실시간 응답이 중요한 연결에서는 실제 지연을 측정한 뒤 TCP_NODELAY 같은 설정을 검토한다.

**네이글은 전송 크기를 제한하는 MTU 규칙이 아니라 작은 TCP 데이터를 모아 보내는 알고리즘이다.**

## 장점과 한계

MTU·MSS를 구분하면 패킷 크기 계산과 경로 장애를 설명하기 쉽다. PMTUD는 경로 조건에 맞는 패킷 크기를 찾고, 네이글 알고리즘은 작은 세그먼트의 수를 줄인다.

고정된 숫자만으로 모든 경로의 최대 데이터 크기를 단정할 수 없다. PMTUD는 ICMP 전달에 영향을 받고, 네이글은 패킷을 줄이는 대신 지연을 만들 수 있다. 두 문제는 캡처와 애플리케이션 응답 시간으로 각각 확인해야 한다.

## 기술면접 질문

### MTU와 MSS는 어떻게 다른가?

MTU는 링크에서 전달할 IP 패킷 전체 크기의 상한입니다. MSS는 TCP 세그먼트에 담는 데이터의 상한이며 연결 설정 중 상대에게 광고합니다. 헤더 옵션과 경로 MTU에 따라 실제 데이터 크기는 MSS보다 작을 수 있습니다.

### PMTUD Black Hole은 어떤 상황에서 생기는가?

경로의 작은 MTU를 넘는 패킷이 폐기되고 필요한 ICMP 피드백까지 차단되면 송신자가 크기를 낮추지 못합니다. 작은 데이터는 성공하지만 큰 응답이나 파일 전송만 멈추는 증상으로 나타날 수 있어 패킷 크기와 ICMP를 함께 확인합니다.
경로 MTU 탐색이 동작하는지 패킷 캡처로 검증합니다.

### 네이글 알고리즘은 언제 지연을 만들 수 있는가?

확인되지 않은 데이터가 있을 때 새 작은 쓰기를 모아 보내므로 즉시 전송이 필요한 대화형 통신은 지연될 수 있습니다. 세그먼트와 응답 시간을 측정해 영향을 확인합니다. 필요하면 해당 연결의 TCP_NODELAY 설정을 검토합니다.

## 복습 체크리스트

- [ ] MTU와 MSS가 포함하는 범위를 구분할 수 있다.
- [ ] 1500바이트 MTU에서 IPv4와 TCP 고정 헤더를 뺀 예시를 설명할 수 있다.
- [ ] IPv4와 IPv6 PMTUD에서 피드백이 달라지는 이유를 설명할 수 있다.
- [ ] ICMP 차단이 큰 전송에 미칠 수 있는 영향을 설명할 수 있다.
- [ ] 네이글 알고리즘의 패킷 수 감소와 지연 비용을 함께 설명할 수 있다.

## 참고 자료

- [TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116686)
- [Q. 네이글 알고리즘이란 무엇인가요? ★☆☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=210101)
- [RFC 1191: Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc1191)
- [RFC 8201: Path MTU Discovery for IP version 6](https://www.rfc-editor.org/rfc/rfc8201)
- [RFC 8899: Packetization Layer Path MTU Discovery for Datagram Transports](https://www.rfc-editor.org/rfc/rfc8899)
- [RFC 896: Congestion Control in IP/TCP Internetworks](https://www.rfc-editor.org/rfc/rfc896)

이전: [TCP와 UDP는 오류를 어떻게 다루는가: 신뢰성·체크섬·CRC](/study/network/tcp-udp-checksums-crc/) · [연재 목록](/study/network/) · 다음: [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](/study/network/tcp-connection-lifecycle/)
