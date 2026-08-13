---
title: TCP/IP 4계층은 데이터를 어떻게 전달하는가
description: TCP/IP 네 계층의 책임과 PDU를 구분하고 TCP 기반 HTTP/1.1 데이터가 캡슐화·역캡슐화되는 과정을 정리합니다.
slug: study/network/tcp-ip-layers-and-encapsulation
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCPIP, Encapsulation, Backend]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 4
---

HTTP 요청이 느릴 때 애플리케이션, TCP, IP, 링크 문제를 한꺼번에 보면 조사 범위가 지나치게 넓어진다. TCP/IP 계층 모델은 실제 구현을 그대로 복사한 그림이 아니라 각 구간의 책임과 관측 지점을 나누는 도구다.

## 핵심 요약

- TCP/IP 모델은 애플리케이션, 전송, 인터넷, 네트워크 접근 계층으로 책임을 나눈다.
- TCP 기반 HTTP 바이트는 하나 이상의 TCP 세그먼트에 담기고, 각 세그먼트는 IP 패킷과 링크 프레임으로 캡슐화된다.
- 링크 프레임은 홉마다 바뀐다. IP의 TTL·Hop Limit 같은 필드도 라우터에서 바뀔 수 있으므로 모든 헤더가 종단까지 그대로 유지되는 것은 아니다.
- HTTP/3는 HTTP를 QUIC에 매핑하고 QUIC 패킷을 UDP 데이터그램에 담으므로 TCP 세그먼트 경로와 구분한다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-ip-layer-stack.svg"
    alt="애플리케이션·전송·인터넷·네트워크 접근 계층의 책임과 PDU를 위에서 아래로 나타낸 TCP/IP 4계층 구조도"
    loading="lazy"
  />
  <figcaption>각 계층은 정해진 책임과 PDU를 가지며 상위 계층의 데이터를 아래 계층으로 전달한다.</figcaption>
</figure>

## TCP/IP 4계층의 책임

애플리케이션 계층은 HTTP, SMTP, SSH, DNS처럼 메시지의 형식과 의미를 정한다. 전송 계층은 포트를 사용해 호스트 안의 통신 대상을 구분하고 종단 간 통신 서비스를 제공한다. TCP는 신뢰성 있는 순서 보장 바이트 스트림을 제공하고, UDP는 연결 설정 절차가 없는 데이터그램 서비스를 제공한다.

인터넷 계층은 IP 주소와 라우팅을 통해 다른 네트워크의 목적지까지 패킷을 전달한다. 네트워크 접근 계층은 현재 연결된 로컬 링크에서 프레임을 만들어 전선, 광섬유, 무선 같은 매체로 보내는 일을 맡는다. 따라서 목적지까지의 경로를 정하는 IP 전달과 바로 다음 링크로 보내는 프레임 전달은 같은 책임이 아니다.

**계층은 프로토콜을 외우는 칸이 아니라 주소, 전달 보장, 장애 관측의 책임을 나누는 경계다.**

## 계층별 PDU와 대표 프로토콜

| 계층 | 책임 | 대표 프로토콜 | PDU |
| --- | --- | --- | --- |
| 애플리케이션 | 사용자·서비스의 네트워크 메시지 형식과 의미를 정의 | HTTP, SMTP, SSH, DNS | 메시지 |
| 전송 | 포트 기반 다중화와 종단 간 전달을 제공 | TCP, UDP | TCP 세그먼트 / UDP 데이터그램 |
| 인터넷 | IP 주소 기반의 패킷 전달과 라우팅을 담당 | IP, ICMP | IP 패킷(데이터그램) |
| 네트워크 접근 | 로컬 링크에서 프레임을 만들고 물리 매체로 전달 | Ethernet, Wi-Fi | 프레임 |

PDU 이름은 어느 계층의 관점에서 데이터를 부르는지 나타낸다. RFC 9293은 애플리케이션 바이트 스트림이 TCP 세그먼트로 나뉘고 각 세그먼트가 IP 데이터그램에 실린다고 설명한다. TCP는 애플리케이션 메시지 경계를 보존하지 않는다. 한 HTTP 메시지가 여러 세그먼트로 나뉠 수 있고, 애플리케이션의 여러 쓰기 결과가 TCP에서 합쳐질 수도 있다.

RFC 768의 UDP는 한 번에 전달받은 데이터그램의 길이를 헤더에 포함한다. TCP와 UDP는 모두 전송 계층에 놓이지만 데이터 경계와 전달 특성이 다르다. 이 글의 다이어그램은 TCP 기반 HTTP/1.1 바이트가 한 세그먼트에 들어가는 단순한 경우를 보여 준다.

## 캡슐화와 역캡슐화

캡슐화는 송신 측이 상위 계층 데이터를 하위 계층에 넘기며 필요한 제어 정보를 붙이는 과정이다. TCP는 포트, 시퀀스 번호, 체크섬을 세그먼트 헤더에 넣는다. IP는 출발지·목적지 주소와 전달 제어 정보를 IP 헤더에 넣는다. 링크 계층은 현재 링크의 다음 홉으로 보내기 위한 프레임 헤더와 기술에 따른 트레일러를 더한다.

역캡슐화는 수신 측이 프레임, IP 패킷, TCP 세그먼트를 차례로 처리해 상위 계층에 페이로드를 넘기는 과정이다. 각 계층은 헤더를 단순히 제거하는 것이 아니라 목적지, 길이, 체크섬, 연결 상태처럼 자신에게 필요한 정보를 검증하고 사용한다.

중간 라우터는 수신 프레임에서 IP 패킷을 꺼내 다음 링크의 새 프레임에 담는다. 이때 IPv4 TTL이나 IPv6 Hop Limit을 감소시키고 관련 헤더를 처리한다. NAT, 터널, 방화벽 같은 중간 장비는 주소를 바꾸거나 패킷을 다시 캡슐화할 수도 있다. 따라서 링크 프레임뿐 아니라 모든 상위 헤더가 언제나 비트 단위로 그대로 유지된다고 생각하면 안 된다.

**종단 간 목적지는 IP가 표현하지만, 실제 프레임의 목적지는 각 링크의 다음 홉이다.**

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-encapsulation-flow.svg"
    alt="TCP 기반 HTTP/1.1 메시지가 송신 측에서 TCP 세그먼트, IP 패킷, 링크 프레임으로 캡슐화되고 수신 측에서 역순으로 처리되는 흐름도"
    loading="lazy"
  />
  <figcaption>TCP 기반 HTTP/1.1 예시에서 송신 측은 계층 정보를 누적하고, 수신 측은 링크 프레임부터 역순으로 처리한다.</figcaption>
</figure>

링크 계층의 CRC와 TCP 체크섬은 모두 오류 검출에 쓰이지만 보호 범위가 다르다. Ethernet FCS의 CRC는 한 링크에서 받은 프레임을 검증한다. TCP 체크섬은 TCP 헤더·데이터와 IP 의사 헤더를 계산에 포함해 종단에서 세그먼트 오류를 검사한다. 어느 쪽도 암호학적 무결성이나 인증을 제공하지 않는다.

## OSI 7계층과 어떻게 대응하는가

학습할 때는 TCP/IP의 애플리케이션 계층을 OSI의 애플리케이션·표현·세션 계층과 대응시켜 볼 수 있다. 네트워크 접근 계층은 데이터 링크·물리 계층에 대략 대응한다. 전송 계층과 인터넷 계층은 각각 OSI의 전송 계층과 네트워크 계층에 가깝다. 이 대응은 책임을 비교하는 학습용 지도다.

TLS처럼 전송 계층 위에서 보안 기능을 제공하거나 QUIC처럼 전송·보안 기능을 묶는 프로토콜은 표 한 칸에만 넣기 어렵다. OSI 모델과 TCP/IP 모델 중 하나가 다른 하나의 정확한 구현 명세라고 생각하면 실제 스택의 경계를 놓치게 된다.

## HTTP 요청이 네트워크를 통과하는 과정

브라우저가 이미 설정된 TCP 연결에서 HTTP/1.1 `GET /articles`를 보낸다고 가정하자. DNS 조회, TCP 연결, TLS 협상은 예시에서 생략한다. HTTP 메시지의 바이트는 TCP가 정한 크기의 세그먼트 하나 이상에 담긴다. 각 세그먼트는 IP 패킷에, IP 패킷은 현재 링크의 프레임에 담긴다. HTTP/2도 TCP 바이트 스트림 위에 자체 바이너리 프레임을 두므로 HTTP/2 프레임과 TCP 세그먼트의 경계가 일치한다고 보장할 수 없다.

프레임은 스위치나 다음 홉 라우터로 전달된다. 라우터는 IP 목적지와 라우팅 테이블로 다음 홉을 고른 뒤 해당 링크의 새 프레임을 만든다. 목적지 호스트는 프레임, IP, TCP 순서로 처리하고, TCP는 순서가 맞는 바이트 스트림을 애플리케이션에 제공한다. 웹 서버는 그 바이트에서 HTTP 메시지 경계를 해석한다.

HTTP/3는 이 예시의 예외다. RFC 9114는 HTTP 의미를 QUIC 전송 프로토콜에 매핑하고, RFC 9000은 QUIC 패킷이 UDP 데이터그램에 실린다고 정의한다. 따라서 HTTP/3 요청을 설명할 때는 `HTTP/3 → QUIC → UDP 데이터그램 → IP 패킷`의 경로를 사용해야 하며, 이를 TCP 세그먼트라고 부르면 안 된다.

## 장점과 한계

계층화는 HTTP 의미, TCP 전달 제어, IP 라우팅, 링크 전송을 서로 다른 책임으로 나눈다. HTTP 응답 지연을 조사할 때 애플리케이션 처리, TCP 재전송, IP 경로, 링크 오류를 별도 관측 지점으로 둘 수 있다. 하위 링크 기술이 바뀌어도 상위 프로토콜이 같은 인터페이스를 사용하는 이유도 설명하기 쉽다.

반면 계층 모델은 실제 구현의 모든 경계를 그대로 보여 주지 않는다. 오프로딩, NAT, 터널, TLS, QUIC은 여러 계층의 관측을 겹치게 만든다. 체크섬과 CRC는 암호화·인증을 대신하지 않으며, 모델만으로 패킷 경로나 장애 원인을 확정할 수도 없다.

## 기술면접 질문

### TCP/IP 4계층을 나누는 이유

TCP/IP 4계층은 애플리케이션 의미, 종단 간 통신, IP 라우팅, 로컬 링크 전송의 책임을 분리합니다. 이 구분으로 HTTP 처리, TCP 재전송, IP 경로, 링크 오류를 서로 다른 관측 지점에서 진단할 수 있습니다. 다만 실제 구현과 중간 장비가 항상 네 칸으로 정확히 나뉘는 것은 아닙니다.

### 캡슐화와 역캡슐화

캡슐화는 TCP 기반 HTTP 예시에서 HTTP 바이트를 TCP 세그먼트, IP 패킷, 링크 프레임에 차례로 담는 과정입니다. 한 HTTP 메시지와 한 TCP 세그먼트가 일대일로 대응하지는 않습니다. 라우터는 다음 링크의 새 프레임을 만들고 IP의 TTL·Hop Limit을 처리하며, HTTP/3는 QUIC over UDP를 사용하므로 TCP 경로와 구분해야 합니다.

### OSI 7계층과 TCP/IP 4계층의 차이

OSI 7계층은 통신 역할을 애플리케이션부터 물리 계층까지 세분화한 참조 모델입니다. TCP/IP 모델은 인터넷 프로토콜 스위트의 애플리케이션, 전송, 인터넷, 네트워크 접근 책임을 중심으로 설명합니다. 두 모델의 대응은 학습용 비교이며 TLS나 QUIC 같은 실제 프로토콜이 반드시 한 계층에만 들어맞는 것은 아닙니다.

## 복습 체크리스트

- [ ] HTTP 메시지와 TCP 세그먼트의 경계가 일대일로 대응하지 않음을 설명할 수 있다.
- [ ] TCP 기반 HTTP 메시지, TCP 세그먼트, IP 패킷, 링크 프레임을 계층별 PDU로 구분할 수 있다.
- [ ] HTTP/3가 QUIC over UDP를 사용하므로 TCP 캡슐화 예시와 다름을 설명할 수 있다.
- [ ] 송신 측의 캡슐화와 수신 측의 역캡슐화 순서를 설명할 수 있다.
- [ ] IP 라우팅과 홉별 링크 프레임 전달의 역할 차이를 설명할 수 있다.
- [ ] IP 라우팅과 로컬 링크 프레임 전달의 역할 차이를 설명할 수 있다.
- [ ] 라우터에서 링크 프레임과 IP의 TTL·Hop Limit이 어떻게 달라지는지 설명할 수 있다.
- [ ] OSI 7계층과 TCP/IP 4계층의 대응이 학습용 비교임을 설명할 수 있다.
- [ ] 링크 CRC와 TCP 체크섬의 계층 및 보호 범위가 다름을 구분할 수 있다.

## 참고 자료

- [TCP/IP 4계층 #1. 개념, 캡슐화, 비캡슐화, PDU, OSI 7계층 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116066)
- [TCP/IP 4계층 #3. 애플리케이션 계층(application) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116067)
- [TCP/IP 4계층 #5. 인터넷 계층(network) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=132275)
- [RFC 1122: Requirements for Internet Hosts — Communication Layers](https://www.rfc-editor.org/rfc/rfc1122)
- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)

이전: [유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준](/study/network/network-classification/) · [연재 목록](/study/network/) · 다음: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/)
