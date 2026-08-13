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

TCP와 UDP의 차이를 헤더 크기나 속도만으로 설명하면 애플리케이션이 실제로 필요한 보장을 놓치기 쉽다. 여기에 MTU와 MSS까지 섞이면 연결은 되지만 큰 데이터만 멈추는 문제를 해석하기도 어려워진다.

## 핵심 요약

- TCP는 신뢰성 있는 순서 보장 바이트 스트림을 제공하고, UDP는 전달·순서 보장을 추가하지 않는 데이터그램 서비스를 제공한다.
- 링크 MTU는 해당 링크에서 단편화 없이 보낼 수 있는 IP 패킷 크기의 상한이다. TCP MSS는 TCP 데이터 옥텟의 상한을 광고한다.
- 고전적 PMTUD는 ICMP Packet Too Big 피드백으로 경로 MTU 추정치를 낮춘다.
- PLPMTUD는 전송·패킷화 계층의 프로브와 확인을 사용하며 ICMP 수신에 의존하지 않는다.

## TCP와 UDP의 선택 기준

| 프로토콜 | 연결 준비 | 순서·손실 처리 | 데이터 경계 | 기본 헤더 | 선택 기준 |
| --- | --- | --- | --- | --- | --- |
| TCP | 연결 상태를 동기화한 뒤 통신한다. | 시퀀스 번호, ACK, 재전송, 흐름·혼잡 제어를 사용한다. | 바이트 스트림이므로 애플리케이션이 메시지 경계를 만든다. | 옵션이 없을 때 20바이트 | 순서 보장 스트림과 손실 복구가 필요할 때 |
| UDP | 프로토콜 수준의 핸드셰이크가 없다. | 전달·순서·중복 제거를 보장하지 않는다. | 한 UDP 데이터그램의 경계를 보존한다. | 8바이트 | 애플리케이션이 손실 정책과 시간 제약을 직접 정할 때 |

TCP는 애플리케이션이 바이트 손실 복구와 순서 정렬을 매번 구현하지 않게 한다. 반면 연결 상태와 혼잡 제어가 필요하며, 스트림 자체에는 메시지 경계가 없다. UDP는 프로토콜 수준의 연결 설정이 없지만 운영체제 소켓 API에서 특정 피어를 지정하는 `connect` 동작과는 구분해야 한다.

UDP의 단순함이 항상 더 짧은 지연을 보장하지는 않는다. 필요한 재전송, 혼잡 제어, 중복 제거를 애플리케이션이 구현하면 비용이 다시 생긴다. IPv4에서는 UDP 체크섬 값 0으로 체크섬 생략을 표현할 수 있지만, IPv6에서는 제한된 예외를 제외하고 UDP 체크섬을 사용해야 한다.

**프로토콜은 빠르다는 인상보다 유실·순서·메시지 경계·혼잡 제어를 어느 계층이 맡을지로 선택한다.**

## TCP의 신뢰성을 구성하는 장치

TCP는 연결을 설정할 때 두 종단이 초기 시퀀스 번호를 독립적으로 선택해 교환한다. 이후 바이트마다 시퀀스 공간을 부여하고 누적 ACK로 다음에 기대하는 바이트를 알린다. 송신 측은 타임아웃이나 중복 ACK 같은 신호로 손실을 감지해 재전송한다. TCP 체크섬은 세그먼트 오류를 검출하고, 수신 윈도와 혼잡 제어는 각각 수신자와 네트워크에 보낼 수 있는 양을 제한한다.

RFC 9293이 설명하는 신뢰성은 연결 안에서 바이트 스트림을 순서대로 전달하는 범위다. ACK는 상대 TCP가 바이트를 수신했다는 뜻이지 상대 애플리케이션이 처리하거나 저장했다는 확인이 아니다. 연결이 재설정되면 애플리케이션은 어느 업무 동작까지 완료됐는지 TCP만으로 알 수 없다. 결제처럼 중복 실행이 위험한 작업은 멱등성 키와 업무 수준의 결과 확인을 별도로 둔다.

## MTU와 MSS의 차이

링크 MTU는 해당 인터페이스에서 단편화 없이 전달할 수 있는 IP 패킷의 최대 크기다. IP 헤더와 전송 계층 헤더, 데이터는 MTU 안에 들어가지만 Ethernet 헤더 같은 링크 계층 헤더는 포함하지 않는다. 경로 MTU(PMTU)는 현재 경로에 놓인 링크 MTU 중 가장 작은 값이다.

MSS 옵션은 SYN에서 상대에게 자신이 받을 수 있는 TCP 데이터 옥텟의 상한을 알린다. 송신 측이 실제로 한 패킷에 넣는 TCP 데이터 크기는 상대가 광고한 MSS, 경로 MTU, 현재 IP·TCP 헤더 크기의 영향을 받는다. 따라서 MTU와 MSS는 모두 바이트 단위를 쓰지만 포함하는 범위와 방향이 다르다.

**MTU는 IP 패킷 전체의 링크 한도이고, MSS는 상대에게 광고하는 TCP 데이터 한도다.**

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/mtu-mss-packet.svg"
    alt="기본 Ethernet과 IPv4 및 TCP 헤더를 가정해 1500바이트 MTU가 IPv4 헤더 20바이트, TCP 헤더 20바이트, MSS 데이터 1460바이트로 나뉘는 패킷 구조도"
    loading="lazy"
  />
  <figcaption>1500·20·20·1460은 옵션이 없는 Ethernet, IPv4, TCP 헤더를 가정한 조건부 예시다.</figcaption>
</figure>

기본 Ethernet의 IP MTU가 1500바이트이고 IPv4 고정 헤더 20바이트와 TCP 고정 헤더 20바이트를 가정하면 MSS 옵션 값은 `1500 - 20 - 20 = 1460`바이트가 된다. RFC 6691에 따르면 MSS 옵션을 계산할 때는 고정 IP·TCP 헤더만 뺀다. TCP Timestamp 같은 옵션을 실제 패킷에 넣는 송신자는 MSS 값 자체를 다시 줄이는 대신 그 패킷의 TCP 데이터 길이를 옵션만큼 줄여야 한다.

IPv6 기본 헤더는 40바이트이므로 같은 1500바이트 MTU와 TCP 고정 헤더만 가정하면 계산 결과는 1440바이트다. 터널 헤더가 추가되거나 경로 MTU가 더 작으면 실제 전송 크기도 줄어든다. 따라서 1460을 TCP의 고정 MSS나 모든 세그먼트의 실제 페이로드 크기로 외우면 안 된다.

## PMTUD가 경로 크기를 찾는 방법

고전적 IPv4 PMTUD에서 송신자는 DF 비트를 설정한다. 라우터가 다음 홉 MTU보다 큰 패킷을 전달할 수 없으면 패킷을 버리고 ICMP Destination Unreachable의 `fragmentation needed` 코드와 다음 홉 MTU를 돌려보낸다. 송신자는 해당 경로의 PMTU 추정치를 낮춰 더 작은 패킷을 보낸다.

IPv6 라우터는 패킷을 단편화하지 않는다. 너무 큰 패킷을 버리고 ICMPv6 Packet Too Big 메시지에 다음 홉 MTU를 담아 보낸다. 송신 노드는 이 피드백으로 PMTU 추정치를 낮춘다. 라우팅이 바뀌면 PMTU도 달라질 수 있으므로 이 값은 경로에 대한 영구 상수가 아니다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/pmtud-path.svg"
    alt="송신자가 MTU 1500 링크와 MTU 1400 링크를 거쳐 수신자로 보내는 경로에서 1500바이트 시도, ICMP 피드백, 1400바이트 이하 재전송의 세 단계를 보여주는 PMTUD 흐름도"
    loading="lazy"
  />
  <figcaption>PMTUD는 경로에서 전달 가능한 가장 작은 크기를 ICMP 피드백으로 발견해 이후 패킷 크기를 조정한다.</figcaption>
</figure>

TCP는 PMTU 정보를 패킷화에 반영해 한 패킷의 TCP 데이터 크기를 줄일 수 있다. IPv4에서는 DF가 없는 패킷을 라우터가 단편화할 수 있지만 고전적 PMTUD는 DF와 ICMP 피드백을 사용한다. IPv6에서 필요한 단편화는 송신 노드만 수행하므로 IPv4 라우터 단편화와 같지 않다.

## PLPMTUD는 무엇이 다른가

ICMP Packet Too Big 메시지는 정책이나 장비 설정 때문에 송신자에게 도착하지 않을 수 있다. PLPMTUD는 패킷화 계층에서 크기가 다른 프로브를 보내고 해당 프로토콜의 확인과 손실 신호를 사용해 안전한 크기를 탐색한다. ICMP 피드백을 활용할 수는 있지만 수신 자체에 의존하지 않는다.

RFC 8899는 UDP 같은 데이터그램 전송을 위한 PLPMTUD를 정의하며, QUIC 등 상위 전송 프로토콜이 프로브 성공 여부를 판단하는 방법을 제공할 수 있다고 설명한다. 따라서 모든 경로 MTU 탐색이 ICMP에만 의존하거나 TCP에만 적용된다고 이해하면 안 된다.

**고전적 PMTUD의 ICMP 의존성과 PLPMTUD의 프로브 기반 탐색을 구분한다.**

## 운영에서 확인할 실패 조건

작은 요청은 성공하지만 큰 응답이나 파일 내려받기만 멈춘다면 PMTUD Black Hole을 가설 중 하나로 둔다. TCP 연결의 SYN은 작아서 통과하지만 데이터 패킷은 경로 MTU를 넘을 수 있다. 고전적 PMTUD에서 필요한 ICMP 피드백까지 차단되면 송신자가 크기를 낮추지 못해 연결이 멈춘 것처럼 보일 수 있다.

응답 크기와 TCP 재전송·타임아웃을 비교하고, IPv4 `fragmentation needed` 또는 ICMPv6 Packet Too Big이 돌아오는지 확인한다. 터널, VPN, 로드밸런서의 캡슐화 오버헤드와 왕복 경로 차이도 살핀다. TCP MSS clamping은 특정 TCP 경로의 우회책이 될 수 있지만 UDP 데이터그램에는 적용되지 않고 근본적인 MTU·ICMP 문제를 가릴 수 있다. 패킷 캡처와 장비 로그로 실제 드롭 지점을 확인한 뒤 적용한다.

## 장점과 한계

TCP는 순서·재전송·흐름·혼잡 제어를 전송 계층에 두어 애플리케이션이 바이트 스트림의 신뢰성 기초를 반복 구현하지 않게 한다. UDP는 데이터그램 경계를 보존하고 프로토콜 동작을 최소화해 애플리케이션이 시간 제약과 손실 정책을 직접 설계할 여지를 준다. PMTUD와 PLPMTUD는 경로에 맞는 패킷 크기를 사용하도록 돕는다.

반면 TCP ACK는 애플리케이션 처리 완료를 보장하지 않고 UDP는 필요한 전달 제어를 상위 계층에 남긴다. MSS 광고값과 실제 TCP 데이터 크기는 옵션과 PMTU에 따라 다를 수 있다. 고전적 PMTUD는 ICMP 필터링에 취약하고 PLPMTUD도 프로브와 확인 신호를 구현해야 하므로 실제 경로에서 검증해야 한다.

## 기술면접 질문

### TCP와 UDP의 차이

TCP는 연결 지향의 순서 보장 바이트 스트림으로 ACK, 재전송, 흐름·혼잡 제어를 제공합니다. UDP는 프로토콜 수준의 핸드셰이크와 전달·순서 보장이 없는 데이터그램 서비스입니다. 따라서 스트림 신뢰성이 필요하면 TCP를, 메시지 경계와 애플리케이션별 손실·시간 정책이 중요하면 UDP를 검토하되 TCP ACK가 업무 처리 완료를 뜻하지는 않음을 구분해야 합니다.

### MTU와 MSS의 차이

MTU는 해당 링크에서 단편화 없이 전달할 수 있는 IP 패킷 전체 크기의 상한입니다. MSS 옵션은 수신 측이 받을 TCP 데이터 옥텟의 상한을 상대에게 광고합니다. 1500 MTU와 IPv4·TCP 고정 헤더를 가정하면 MSS는 1460이지만, 실제 패킷의 TCP 데이터 크기는 옵션과 경로 MTU에 맞춰 더 작아질 수 있습니다.

### PMTUD가 필요한 이유

고전적 PMTUD는 IPv4의 DF와 ICMP `fragmentation needed`, IPv6의 ICMPv6 Packet Too Big으로 경로 MTU 추정치를 낮춥니다. 이 피드백이 차단되면 큰 패킷만 멈추는 Black Hole이 생길 수 있습니다. PLPMTUD는 패킷화 계층의 프로브와 확인을 사용해 ICMP 수신에 의존하지 않는다는 차이가 있습니다.

## 복습 체크리스트

- [ ] TCP ACK가 상대 애플리케이션의 처리 완료를 보장하지 않음을 설명할 수 있다.
- [ ] TCP의 신뢰성이 핸드셰이크뿐 아니라 시퀀스 번호, ACK, 재전송, 체크섬으로 구성됨을 설명할 수 있다.
- [ ] UDP에서 필요한 순서·재전송·중복 제거 보장을 애플리케이션이 설계할 수 있음을 설명할 수 있다.
- [ ] 링크 MTU, 경로 MTU, TCP MSS 광고값을 구분할 수 있다.
- [ ] MTU는 IP 패킷 전체, MSS는 TCP 데이터 크기의 상한임을 구분할 수 있다.
- [ ] 1500·20·20·1460이 기본 Ethernet과 IPv4 및 TCP 헤더를 가정한 예시임을 설명할 수 있다.
- [ ] MSS 옵션은 고정 헤더만 빼고 실제 데이터 길이는 옵션만큼 더 줄인다는 규칙을 설명할 수 있다.
- [ ] IPv4 라우터 단편화와 IPv6 송신자 단편화의 차이를 설명할 수 있다.
- [ ] IPv4 라우터 단편화와 IPv6 송신자 단편화의 차이 및 PMTUD의 ICMP 의존성을 설명할 수 있다.
- [ ] 고전적 PMTUD와 ICMP에 의존하지 않는 PLPMTUD를 구분할 수 있다.

## 참고 자료

- [TCP/IP 4계층 #4. 전송 계층(transport) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=132274)
- [TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116686)
- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 8200: Internet Protocol, Version 6 Specification](https://www.rfc-editor.org/rfc/rfc8200)
- [RFC 6691: TCP Options and Maximum Segment Size](https://www.rfc-editor.org/rfc/rfc6691)
- [RFC 1191: Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc1191)
- [RFC 8201: Path MTU Discovery for IP version 6](https://www.rfc-editor.org/rfc/rfc8201)
- [RFC 8899: Packetization Layer Path MTU Discovery for Datagram Transports](https://www.rfc-editor.org/rfc/rfc8899)

이전: [TCP/IP 4계층은 데이터를 어떻게 전달하는가](/study/network/tcp-ip-layers-and-encapsulation/) · [연재 목록](/study/network/) · 다음: [TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지](/study/network/tcp-connection-lifecycle/)
