---
title: "TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지"
description: TCP의 연결 수립과 종료 과정에서 시퀀스 번호와 상태가 어떻게 바뀌며 TIME_WAIT이 왜 필요한지 정리합니다.
slug: study/network/tcp-connection-lifecycle
contentType: study
publishedAt: 2026-08-11
tags: [Network, TCP, Handshake, TIME_WAIT]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 6
---

TCP는 양방향 바이트 스트림을 제공하므로 연결 수립에서 두 시퀀스 공간을 동기화하고, 정상 종료에서는 각 방향을 따로 닫는다. 숫자를 `x`, `y`로 고정해 상태 전이를 따라가면 `CLOSE_WAIT`과 `TIME_WAIT`이 어느 종단에 남는지도 구분하기 쉽다.

## 핵심 요약

- `SYN seq=x`에 수신 측은 `SYN-ACK seq=y ack=x+1`로 응답하고, 시작 측은 `ACK ack=y+1`로 두 초기 시퀀스 번호를 동기화한다.
- TCP의 ACK는 누적 확인이다. `ack=N`은 일반적으로 `N` 직전까지의 바이트를 받았고 다음으로 `N`을 기대한다는 뜻이다.
- FIN은 한쪽 송신 스트림의 끝만 알린다. ACK와 반대 방향 FIN은 같은 세그먼트로 합쳐질 수도, 서로 다른 시점에 전송될 수도 있다.
- 마지막 ACK를 보낸 쪽은 TIME_WAIT에서 이전 연결의 중복 세그먼트를 격리하고 재전송된 FIN을 다시 ACK할 수 있다.

## 3-way handshake가 확인하는 것

연결 시작 측은 `CLOSED`에서 `SYN_SENT`로 이동하며 `SYN seq=x`를 보낸다. 수신 측은 `LISTEN`에서 SYN을 받고 `SYN_RECEIVED`가 된다. 이어 자신의 ISN `y`와 상대 SYN을 확인하는 `ack=x+1`을 담아 `SYN-ACK seq=y ack=x+1`을 보낸다. 시작 측은 `ACK ack=y+1`을 보내 `ESTABLISHED`가 되고, 수신 측도 이 ACK를 받으면 `ESTABLISHED`가 된다.

세 메시지는 두 방향의 시퀀스 공간을 동기화한다. 수신 측은 시작 측의 SYN을 `ack=x+1`로 확인하고, 시작 측은 수신 측의 SYN을 `ack=y+1`로 확인한다. RFC 9293은 3-way handshake의 주된 이유를 오래된 중복 연결 시작이 새 연결로 오인되는 일을 막는 것이라고 설명한다.

**3-way handshake는 단순한 연결 가능성 검사가 아니라 두 ISN을 확인하고 오래된 SYN과 새 연결을 구분하는 절차다.**

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-three-way-handshake.svg"
    alt="연결 시작 측과 수신 측의 수직 생명선 사이에서 SYN seq=x, SYN-ACK seq=y ack=x+1, ACK ack=y+1이 위에서 아래 순서로 오가며 양쪽이 ESTABLISHED에 이르는 TCP 3-way handshake 상태 전이도"
    loading="lazy"
  />
  <figcaption>두 엔드포인트는 서로 독립적으로 고른 ISN을 SYN과 ACK로 확인한 뒤 ESTABLISHED로 전이한다.</figcaption>
</figure>

## ISN과 Sequence·Acknowledgement Number

ISN(Initial Sequence Number)은 각 TCP 종단이 연결을 시작할 때 선택하는 32비트 초기 시퀀스 번호다. 시작 측의 `x`와 수신 측의 `y`는 독립적이며, 두 방향의 바이트는 각자의 시퀀스 공간에서 진행된다. 실제 ISN은 단순 증가값을 그대로 노출하지 않고 RFC 6528이 설명하는 방식처럼 연결 식별 정보와 비밀값을 반영해 예측 공격을 어렵게 한다.

ACK 번호는 누적 확인의 다음 기대 번호다. `ack=N`은 일반적으로 `N`보다 작은 시퀀스 번호의 모든 바이트를 연속해서 받았다는 뜻이다. SYN은 데이터가 없어도 시퀀스 공간 한 칸을 소비하므로 `SYN seq=x`의 확인은 `ack=x+1`이다. FIN도 한 칸을 소비하며, 데이터가 함께 있다면 데이터 길이와 FIN 한 칸을 모두 더해 확인한다.

선택적 확인 응답(SACK)을 협상하면 수신 측은 누적 ACK 바깥에서 받은 비연속 블록도 추가로 알릴 수 있다. 그래도 TCP 헤더의 기본 Acknowledgment Number는 다음에 기대하는 연속 시퀀스 번호라는 점은 바뀌지 않는다.

## 4-way handshake에서 FIN과 ACK가 분리되는 이유

연결 종료를 먼저 시작한 쪽(active closer)은 FIN을 보내 `FIN_WAIT_1`이 된다. FIN은 해당 종단이 그 방향으로 더 보낼 데이터가 없음을 알린다. 반대 방향 데이터는 계속 받을 수 있다. 상대 측은 FIN을 받으면 ACK를 보내 `CLOSE_WAIT`이 되고, 시작 측은 자신의 FIN이 확인되면 `FIN_WAIT_2`로 이동한다.

첫 ACK는 한 방향의 FIN을 받았다는 확인일 뿐, ACK를 보낸 종단의 송신까지 끝났다는 뜻은 아니다. 상대 애플리케이션은 EOF를 확인한 뒤에도 남은 응답을 보낼 수 있다. 이후 자신의 송신을 닫으면 FIN을 보내 `LAST_ACK`가 되고, 시작 측은 이를 ACK한 뒤 `TIME_WAIT`에 들어간다.

FIN을 받은 애플리케이션이 바로 송신도 닫으면 ACK와 FIN을 한 세그먼트에 함께 실을 수 있다. 이 경우 종료는 세 세그먼트로 보인다. 흔히 말하는 4-way handshake는 ACK와 FIN이 분리된 정상 종료 예시이지 항상 네 개의 세그먼트가 필요하다는 규칙이 아니다.

**TCP 종료 횟수보다 중요한 점은 두 송신 방향이 서로 독립적으로 닫힌다는 사실이다.**

두 종단의 FIN이 교차하는 동시 종료에서는 양쪽이 `FIN_WAIT_1`에서 상대 FIN을 받아 `CLOSING`으로 이동할 수 있다. 각자의 FIN이 확인되면 둘 다 `TIME_WAIT`에 들어간다. 따라서 그림의 `CLOSE_WAIT → LAST_ACK`는 한쪽이 먼저 닫는 대표 흐름이며 모든 종료에서 한쪽만 TIME_WAIT이 된다는 뜻은 아니다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg"
    alt="종료 시작 측과 상대 측의 수직 생명선 사이에서 FIN, ACK, FIN, 마지막 ACK가 위에서 아래 순서로 오가고 종료 시작 측은 TIME_WAIT을 거쳐 CLOSED, 상대 측은 CLOSE_WAIT과 LAST_ACK를 거쳐 CLOSED가 되는 TCP 4-way handshake 상태 전이도"
    loading="lazy"
  />
  <figcaption>FIN 수신 측의 ACK는 상대 송신 스트림의 끝을 확인하며, 자신의 송신 종료는 나중의 별도 FIN으로 알린다.</figcaption>
</figure>

## TIME_WAIT이 필요한 이유

마지막 ACK에는 다시 돌아오는 ACK가 없다. 이 ACK가 유실되면 상대는 `LAST_ACK`에서 FIN을 재전송한다. TIME_WAIT에 있는 종단은 그 FIN을 다시 ACK하고 2MSL 타이머를 다시 시작할 수 있다. 상대 FIN 자체가 유실되었다면 종료 시작 측은 `FIN_WAIT_2`에서 재전송된 FIN을 기다린 뒤 ACK하고 TIME_WAIT에 들어간다.

같은 4-tuple의 새 연결을 너무 빨리 만들면 이전 연결에서 지연된 중복 세그먼트가 새 연결과 겹칠 수 있다. TIME_WAIT은 이전 세그먼트가 네트워크에서 사라질 시간을 두고, 새 ISN 선택과 함께 연결 세대를 구분한다. RFC 9293은 능동적으로 닫힌 연결이 2×MSL 동안 TIME_WAIT에 머물도록 요구한다. 실제 운영체제가 사용하는 타이머와 재사용 조건은 구현별로 확인해야 한다.

**TIME_WAIT은 연결 누수가 아니라 정상 종료의 정확성을 지키기 위한 TCP 상태다.**

## CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법

`CLOSE_WAIT`은 로컬 TCP가 상대 FIN을 받아 애플리케이션에 EOF를 알렸고, 로컬 애플리케이션이 송신 방향을 닫기를 기다리는 상태다. 이 상태가 오래 누적되면 예외 경로와 리소스 정리에서 소켓을 닫는지 추적한다. 원격 종단이 먼저 닫은 이유도 함께 보되, 로컬 CLOSE_WAIT의 해제는 로컬 애플리케이션 동작에 달려 있다.

`TIME_WAIT`은 보통 active closer가 만든 정상 종료의 흔적이다. 개수가 증가했을 때는 누가 active close를 하는지, 요청량과 짧은 연결 비율, 임시 포트 범위, 커넥션 재사용 정책, 운영체제의 TIME_WAIT 및 재사용 설정을 함께 본다. 2MSL의 실제 시간과 TIME_WAIT 개수만으로 장애라고 단정하지 말고, 포트 고갈·연결 실패·지연·재시도 지표와 배포 또는 트래픽 변화도 함께 비교한다.

## 장점과 한계

3-way handshake는 두 초기 시퀀스 번호를 동기화하고 오래된 중복 연결 시작을 구분한다. 정상 종료는 두 송신 방향의 끝을 따로 표현한다. TIME_WAIT은 마지막 ACK 재전송과 이전 연결의 중복 세그먼트 격리에 필요한 상태를 유지한다.

반면 연결 수립·종료에는 왕복 지연과 상태 관리 비용이 든다. 짧은 연결이 많으면 TIME_WAIT과 임시 포트 사용량이 커질 수 있다. 다이어그램은 ACK·FIN 결합, 재전송, 동시 종료, RST를 모두 담지 않은 대표 흐름이므로 운영 판단에서는 패킷, 로그, 소켓 오류, 커넥션 재사용 설정을 함께 본다.

## 기술면접 질문

### 3-way handshake가 필요한 이유

3-way handshake는 두 종단의 초기 시퀀스 번호를 교환·확인하고 오래된 중복 연결 시작을 구분합니다. 수신 측은 `SYN-ACK seq=y ack=x+1`로 시작 측 SYN을 확인하면서 자신의 ISN을 보냅니다. 마지막 `ACK ack=y+1`이 있어야 수신 측도 자신의 SYN이 현재 연결의 시작 측에 확인됐음을 알고 ESTABLISHED로 이동합니다.

### 4-way handshake에서 FIN과 ACK가 분리되는 이유

TCP는 두 송신 방향을 독립적으로 닫기 때문에 FIN을 받은 쪽은 먼저 ACK로 한 방향의 끝만 확인할 수 있습니다. 남은 응답을 보낸 뒤 자신의 FIN을 별도로 보낼 수 있어 대표 흐름은 네 세그먼트가 됩니다. 바로 송신도 닫는 경우 ACK와 FIN을 한 세그먼트에 합칠 수 있으므로 항상 네 세그먼트가 필요한 것은 아닙니다.

### TIME_WAIT이 필요한 이유

TIME_WAIT은 마지막 ACK가 유실되어 상대가 FIN을 재전송했을 때 ACK를 다시 보낼 상태를 유지합니다. 또한 이전 연결의 지연 중복 세그먼트가 같은 4-tuple의 새 연결에 섞이는 위험을 줄입니다. RFC 9293은 능동적으로 닫힌 연결에 2MSL을 요구하지만 실제 타이머와 재사용 조건은 운영체제 구현을 확인해야 합니다.

## 복습 체크리스트

- [ ] `SYN seq=x`, `SYN-ACK seq=y ack=x+1`, `ACK ack=y+1`의 ACK 값이 왜 1 증가하는지 설명할 수 있다.
- [ ] 3-way handshake가 두 ISN을 동기화하고 오래된 중복 SYN을 구분함을 설명할 수 있다.
- [ ] 시작 측과 수신 측이 독립적인 ISN을 선택하고, 마지막 ACK가 양방향 확인을 완성함을 설명할 수 있다.
- [ ] 누적 ACK와 선택적 확인 응답의 역할을 구분할 수 있다.
- [ ] FIN은 보낸 쪽의 송신 종료이고 ACK는 그 스트림 끝의 수신 확인일 뿐, ACK 송신자의 독립적인 송신 종료는 아님을 설명할 수 있다.
- [ ] ACK와 FIN을 결합하면 정상 종료가 세 세그먼트로 보일 수 있음을 설명할 수 있다.
- [ ] 마지막 ACK를 보낸 종단이 TIME_WAIT에서 재전송 FIN 처리와 이전 연결 격리를 지원함을 설명할 수 있다.
- [ ] active closer가 TIME_WAIT에서 마지막 ACK 재전송과 지연 세그먼트 제거를 지원함을 설명할 수 있다.
- [ ] CLOSE_WAIT과 TIME_WAIT을 상태 수치 하나로 장애로 단정하지 않고 역할·트래픽·코드·설정을 함께 점검할 수 있다.

## 참고 자료

- [TCP의 연결성립 : 3-웨이 핸드셰이크 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116078)
- [TCP의 연결해제 : 4-웨이 핸드셰이크와TIME_WAIT ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=130876)
- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 2018: TCP Selective Acknowledgment Options](https://www.rfc-editor.org/rfc/rfc2018)
- [RFC 6528: Defending against Sequence Number Attacks](https://www.rfc-editor.org/rfc/rfc6528)

이전: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/) · [연재 목록](/study/network/)
