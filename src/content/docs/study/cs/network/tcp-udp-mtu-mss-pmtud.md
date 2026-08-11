---
title: TCP와 UDP, 그리고 MTU·MSS·PMTUD
description: TCP와 UDP의 보장 차이를 비교하고 MTU·MSS·PMTUD가 실제 전송 크기를 결정하는 과정을 정리합니다.
slug: study/network/tcp-udp-mtu-mss-pmtud
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCP, UDP, PMTUD]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 5
---

## 핵심 요약

TCP는 신뢰성 있는 순서 보장 바이트 스트림을, UDP는 최소한의 프로토콜 장치로 메시지를 보내는 전송 방식을 제공한다. MTU는 링크가 전달할 수 있는 IP 패킷 크기의 상한이고, MSS는 한 TCP 세그먼트에 실을 데이터 크기의 상한을 설명한다. PMTUD는 실제 경로에서 가장 작은 MTU를 찾아 TCP가 너무 큰 패킷을 반복해서 보내지 않도록 돕는다.

## TCP와 UDP의 선택 기준

| 연결 준비 | 순서·재전송 | 데이터 경계 | 헤더 부담 | 선택 기준 |
| --- | --- | --- | --- | --- |
| TCP는 연결 상태를 설정한 뒤 통신한다. | 순서, ACK, 재전송으로 손실·순서 문제를 처리한다. | 바이트 스트림이므로 애플리케이션이 메시지 경계를 정한다. | 기본 헤더는 옵션이 없을 때 20바이트다. | 정확한 전달과 순서가 필요한 HTTP 응답, DB 연결, 파일 전송에 알맞다. |
| UDP는 연결 설정 없이 데이터그램을 보낸다. | 전달·순서·중복 제거 보장은 애플리케이션이 설계한다. | 데이터그램 하나가 메시지 경계다. | 헤더는 8바이트로 간결하다. | 지연을 줄이고 자체 손실 처리나 최신 값 우선 정책을 둘 수 있는 경우에 알맞다. |

TCP의 신뢰성은 애플리케이션이 매번 재전송·순서 정렬을 구현하지 않아도 되는 장점이지만, 지연과 연결 상태 관리가 없어진다는 뜻은 아니다. UDP의 가벼움도 성공을 보장한다는 뜻이 아니므로, 필요한 경우 애플리케이션 수준에서 타임아웃, 중복 제거, 순번, 재시도 정책을 정해야 한다. 프로토콜 선택은 단순히 빠르거나 느리다는 인상보다 데이터 유실·순서 역전·연결 관리에 어떤 보장이 필요한지로 결정한다.

## TCP의 신뢰성을 구성하는 장치

TCP는 연결을 설정할 때 각 종단이 초기 시퀀스 번호를 독립적으로 선택하고, 이를 교환·확인하여 연결 상태를 동기화한다. 이후 전송한 바이트에 시퀀스 번호를 붙여 수신 순서를 식별한다. 수신 측 ACK는 다음에 기대하는 바이트 번호를 알려 주며, 송신 측은 ACK가 오지 않거나 손실을 감지하면 데이터를 재전송한다. TCP 체크섬은 세그먼트의 오류를 검출하며, 시퀀스 번호와 재전송은 그 오류나 손실을 복구하는 흐름의 일부다.

따라서 핸드셰이크만으로 TCP의 신뢰성을 설명하면 부족하다. RFC 9293은 TCP가 순서 보장 바이트 스트림을 제공하고, 시퀀스 번호로 손실을 검출하며, 세그먼트별 체크섬으로 오류를 검출하고 재전송으로 보정한다고 설명한다. 다만 TCP가 애플리케이션 의미까지 보장하지는 않으므로, 결제처럼 중복 실행이 위험한 작업은 멱등성 키와 업무 수준의 확인을 별도로 설계해야 한다.

## MTU와 MSS의 차이

MTU는 한 링크에서 전달할 수 있는 IP 패킷의 최대 크기이며 IP 헤더와 TCP 헤더, 데이터가 모두 이 한도 안에 들어간다. MSS는 TCP가 한 세그먼트에 싣는 데이터 부분의 최대 크기로, 상대가 SYN에서 광고한 값과 송신 측 IP 계층이 허용하는 크기 중 더 작은 값의 영향을 받는다. 그러므로 MTU와 MSS를 같은 단위의 숫자로 비교하더라도, MTU에는 헤더가 포함되고 MSS는 TCP 데이터 크기를 가리킨다는 차이가 있다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/mtu-mss-packet.svg"
    alt="기본 Ethernet과 IPv4 및 TCP 헤더를 가정해 1500바이트 MTU가 IPv4 헤더 20바이트, TCP 헤더 20바이트, MSS 데이터 1460바이트로 나뉘는 패킷 구조도"
    loading="lazy"
  />
  <figcaption>1500·20·20·1460은 옵션이 없는 Ethernet, IPv4, TCP 헤더를 가정한 조건부 예시다.</figcaption>
</figure>

예를 들어 기본 Ethernet에서 IP MTU를 1500바이트로 보고, IPv4 기본 헤더 20바이트와 TCP 기본 헤더 20바이트를 가정하면 `1500 - 20 - 20 = 1460`바이트가 데이터의 예시 MSS가 된다. 이 숫자는 TCP 옵션, IP 옵션, IPv6 헤더와 확장 헤더, 터널 오버헤드가 있으면 달라진다. 따라서 1460을 모든 네트워크의 고정값으로 두기보다, 실제 경로와 헤더 조건으로 계산한 예시로 이해해야 한다.

## PMTUD가 경로 크기를 찾는 방법

경로 MTU는 출발지부터 목적지까지 지나는 링크 MTU 가운데 가장 작은 값이다. IPv4 PMTUD에서는 송신자가 DF 비트를 사용해 중간 라우터 단편화를 막고, 다음 홉 MTU보다 큰 패킷을 받은 라우터가 ICMP Destination Unreachable의 fragmentation needed 응답으로 알려 주면 송신자가 더 작게 보낸다. IPv6에서는 라우터가 패킷을 단편화하지 않고 너무 큰 패킷을 버린 뒤 ICMPv6 Packet Too Big을 보내며, 송신자는 그 MTU 정보를 바탕으로 패킷 크기를 줄인다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/pmtud-path.svg"
    alt="송신자가 MTU 1500 링크와 MTU 1400 링크를 거쳐 수신자로 보내는 경로에서 1500바이트 시도, ICMP 피드백, 1400바이트 이하 재전송의 세 단계를 보여주는 PMTUD 흐름도"
    loading="lazy"
  />
  <figcaption>PMTUD는 경로에서 전달 가능한 가장 작은 크기를 ICMP 피드백으로 발견해 이후 패킷 크기를 조정한다.</figcaption>
</figure>

TCP는 이 PMTU 정보를 세그먼트화에 반영해 지나치게 큰 TCP 데이터를 줄일 수 있다. IPv4에서는 DF를 설정하지 않은 패킷을 라우터가 단편화할 수 있지만, PMTUD의 일반적인 흐름은 DF와 ICMP 오류를 사용한다. IPv6의 단편화는 송신자만 수행할 수 있으므로, IPv4의 라우터 단편화와 같은 동작으로 설명하면 안 된다.

## 운영에서 확인할 실패 조건

작은 요청은 성공하지만 큰 응답이나 파일 내려받기만 멈추거나 재전송을 반복한다면 PMTUD Black Hole 가능성을 하나의 가설로 둔다. 먼저 응답 크기와 TCP 재전송·타임아웃을 비교하고, 이어서 방화벽이나 보안 장비가 IPv4 ICMP fragmentation needed 또는 ICMPv6 Packet Too Big을 송신자까지 전달하는지 확인한다. 그 다음 터널, VPN, 로드밸런서, 프록시를 포함한 실제 왕복 경로의 MTU와 오버헤드를 확인해 좁아진 링크가 있는지 찾는다.

ICMP가 차단되면 너무 큰 패킷이 어느 링크에서 버려져도 송신자가 줄여야 할 크기를 배우지 못할 수 있다. 이때 TCP 연결 설정은 성공했는데 큰 데이터 전송에서 정지하는 양상이 나타날 수 있지만, 이를 곧바로 PMTUD 문제로 단정해서는 안 된다. 패킷 캡처, 장비 로그, 경로별 MTU 검증으로 ICMP 도달 여부와 실제 드롭 지점을 함께 확인한 뒤 MSS 조정이나 경로 설정 변경을 검토한다.

## 장점과 한계

TCP는 순서·재전송·흐름 제어를 전송 계층에 두어 애플리케이션이 신뢰성 기초를 반복 구현하지 않도록 한다. UDP는 고정된 연결 상태와 신뢰성 동작을 최소화하므로, 실시간성이나 자체 프로토콜 정책이 중요한 경우 선택지를 넓힌다. PMTUD는 경로에 맞는 패킷 크기를 찾아 단편화와 불필요한 손실을 줄이는 데 도움을 준다.

반면 TCP의 전달 보장이 업무 처리의 정확성을 보장하지는 않고, UDP는 필요한 보장을 애플리케이션에 남긴다. MTU와 MSS의 실제 값은 옵션, 터널, 경로 변경에 따라 달라지며 하나의 기본값으로 고정할 수 없다. PMTUD는 ICMP 피드백과 경로 관측에 의존하므로 필터링, 비대칭 경로, 장비 설정이 있는 환경에서는 운영 검증이 필요하다.

## 기술면접 질문

### TCP와 UDP의 차이

TCP는 연결 지향의 순서 보장 바이트 스트림으로 ACK와 재전송을 통해 손실을 처리합니다. UDP는 연결 설정과 신뢰성 메커니즘을 최소화한 데이터그램 방식이라 필요한 전달 보장을 애플리케이션이 설계합니다. 따라서 정확한 전달과 순서가 중요하면 TCP를, 지연과 자체 제어 정책이 더 중요하면 UDP를 검토합니다.

### MTU와 MSS의 차이

MTU는 링크에서 전달할 수 있는 IP 패킷 전체 크기의 상한입니다. MSS는 TCP 세그먼트의 데이터 부분에 실을 수 있는 최대 크기입니다. 기본 Ethernet과 IPv4 및 TCP 헤더를 가정한 1500 MTU 예시에서 MSS는 1460이지만 헤더와 터널 조건에 따라 달라집니다.

### PMTUD가 필요한 이유

PMTUD는 경로 중 가장 작은 MTU를 찾아 송신자가 그보다 작은 패킷을 보내도록 합니다. IPv4는 DF와 ICMP fragmentation needed를, IPv6는 ICMPv6 Packet Too Big을 피드백으로 사용합니다. 이 피드백이 차단되면 큰 데이터 전송이 멈추는 Black Hole 양상이 나타날 수 있어 경로와 ICMP 전달을 함께 점검해야 합니다.

## 복습 체크리스트

- [ ] TCP의 신뢰성이 핸드셰이크뿐 아니라 시퀀스 번호, ACK, 재전송, 체크섬으로 구성됨을 설명할 수 있다.
- [ ] UDP에서 필요한 순서·재전송·중복 제거 보장을 애플리케이션이 설계할 수 있음을 설명할 수 있다.
- [ ] MTU는 IP 패킷 전체, MSS는 TCP 데이터 크기의 상한임을 구분할 수 있다.
- [ ] 1500·20·20·1460이 기본 Ethernet과 IPv4 및 TCP 헤더를 가정한 예시임을 설명할 수 있다.
- [ ] IPv4 라우터 단편화와 IPv6 송신자 단편화의 차이 및 PMTUD의 ICMP 의존성을 설명할 수 있다.

## 참고 자료

- [TCP/IP 4계층 #4. 전송 계층(transport) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=132274)
- [TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116686)
- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 1191: Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc1191)
- [RFC 8201: Path MTU Discovery for IP version 6](https://www.rfc-editor.org/rfc/rfc8201)

이전: [TCP/IP 4계층은 데이터를 어떻게 전달하는가](/study/network/tcp-ip-layers-and-encapsulation/) · [연재 목록](/study/network/)
