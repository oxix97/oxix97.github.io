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

TCP는 양방향 바이트 스트림을 제공하므로, 연결 수립에서는 양쪽이 서로의 초기 시퀀스 번호와 통신 가능성을 확인하고 종료에서는 각 방향을 따로 닫는다. 이 글에서는 숫자를 `x`, `y`로 고정해 3-way handshake와 4-way handshake의 상태 변화를 따라가고, 운영에서 자주 보이는 `CLOSE_WAIT`, `TIME_WAIT`을 구분한다.

## 핵심 요약

- `SYN seq=x`에 대해 수신 측은 `SYN-ACK seq=y ack=x+1`로 응답하고, 시작 측은 `ACK ack=y+1`로 양쪽 ISN을 확인한다.
- SYN과 FIN은 각각 시퀀스 공간 한 칸을 소비하므로, ACK 번호는 상대가 다음에 기대하는 시퀀스 번호를 뜻한다.
- TCP는 양방향 스트림을 독립적으로 닫기 때문에 FIN을 받은 쪽이 남은 데이터를 처리한 뒤 FIN을 보낼 수 있다.
- active closer의 TIME_WAIT은 마지막 ACK 재전송과 이전 연결의 지연 세그먼트가 새 연결에 섞이는 위험을 줄인다.

## 3-way handshake가 확인하는 것

연결 시작 측은 `CLOSED`에서 `SYN_SENT`로 이동하며 `SYN seq=x`를 보낸다. 수신 측은 `LISTEN`에서 SYN을 받고 `SYN_RECEIVED`로 이동한 뒤, 자신의 독립적인 ISN `y`와 상대 SYN을 확인하는 `ack=x+1`을 담아 `SYN-ACK seq=y ack=x+1`을 보낸다. 시작 측은 이를 받고 `ACK ack=y+1`을 보내 `ESTABLISHED`가 되며, 수신 측도 이 ACK를 받아 `ESTABLISHED`가 된다.

세 메시지는 단순한 왕복 횟수가 아니라 양 방향을 확인한다. 수신 측은 시작 측의 SYN을 받았음을 `ack=x+1`로 알리고, 시작 측은 수신 측의 SYN을 `ack=y+1`로 확인한다. 마지막 ACK가 있어야 수신 측도 처음 SYN이 오래된 중복 세그먼트가 아니라 현재 시작 측이 확인한 연결인지 구분할 수 있다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-three-way-handshake.svg"
    alt="연결 시작 측과 수신 측의 수직 생명선 사이에서 SYN seq=x, SYN-ACK seq=y ack=x+1, ACK ack=y+1이 위에서 아래 순서로 오가며 양쪽이 ESTABLISHED에 이르는 TCP 3-way handshake 상태 전이도"
    loading="lazy"
  />
  <figcaption>두 엔드포인트는 서로 독립적으로 고른 ISN을 SYN과 ACK로 확인한 뒤 ESTABLISHED로 전이한다.</figcaption>
</figure>

## ISN과 Sequence·Acknowledgement Number

ISN(Initial Sequence Number)은 각 TCP 엔드포인트가 새 연결을 시작할 때 고르는 초기 시퀀스 번호다. 시작 측의 `x`와 수신 측의 `y`는 같은 값일 필요가 없으며, 각 방향의 데이터 흐름은 각자의 시퀀스 공간에서 따로 진행된다. RFC 9293도 새 연결의 모호성을 줄이기 위해 새 32비트 ISN을 선택하고, TIME_WAIT과 ISN 선택이 이전 연결의 세그먼트를 구분하는 데 함께 쓰인다고 설명한다.

ACK 번호는 지금까지 받은 마지막 번호가 아니라 다음에 받고 싶은 시퀀스 번호다. SYN은 데이터가 없어도 시퀀스 공간 한 칸을 소비하므로 `SYN seq=x`의 확인은 `ack=x+1`이다. 같은 규칙으로 FIN도 시퀀스 공간을 소비하며, 데이터가 있는 세그먼트라면 데이터 길이까지 더한 다음 번호를 ACK한다.

## 4-way handshake에서 FIN과 ACK가 분리되는 이유

연결 종료를 먼저 시작한 쪽(active closer)은 `ESTABLISHED`에서 FIN을 보내 `FIN_WAIT_1`이 된다. 상대 측은 FIN을 받으면 ACK를 보내 `CLOSE_WAIT`이 되며, 시작 측은 ACK를 받고 `FIN_WAIT_2`로 이동한다. 이 ACK는 상대가 더 이상 시작 측에서 오는 데이터를 받지 않겠다는 뜻을 확인할 뿐, 상대 애플리케이션이 자신의 송신을 끝냈다는 뜻은 아니다.

TCP의 양방향 스트림은 독립적으로 닫힌다. 상대 측 애플리케이션은 FIN을 받은 뒤 이미 받은 데이터를 처리하거나 남은 응답을 보낸 뒤에야 자신의 `close()`를 호출할 수 있다. 그래서 상대 측은 나중에 FIN을 보내 `LAST_ACK`가 되고, 시작 측은 이를 ACK한 뒤 `TIME_WAIT`으로 들어간다; 이 분리 때문에 일반적인 종료 흐름을 4-way handshake라고 부른다.

<figure class="study-diagram">
  <img
    src="/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg"
    alt="종료 시작 측과 상대 측의 수직 생명선 사이에서 FIN, ACK, FIN, 마지막 ACK가 위에서 아래 순서로 오가고 종료 시작 측은 TIME_WAIT을 거쳐 CLOSED, 상대 측은 CLOSE_WAIT과 LAST_ACK를 거쳐 CLOSED가 되는 TCP 4-way handshake 상태 전이도"
    loading="lazy"
  />
  <figcaption>FIN을 받은 쪽은 ACK로 수신 방향을 먼저 닫고, 애플리케이션이 송신을 끝낸 시점에 별도 FIN을 보낼 수 있다.</figcaption>
</figure>

## TIME_WAIT이 필요한 이유

마지막 ACK를 보낸 active closer는 곧바로 상태를 버리지 않고 TIME_WAIT에 머문다. 상대의 FIN이나 마지막 ACK가 네트워크에서 유실되면 상대는 FIN을 재전송할 수 있고, TIME_WAIT 상태의 쪽은 이를 다시 ACK할 수 있다. 따라서 마지막 ACK의 전달을 재시도할 기회를 보장한다.

또한 같은 4-tuple(출발지 IP·포트, 목적지 IP·포트)의 새 연결이 너무 빨리 만들어지면 이전 연결에서 지연된 세그먼트가 새 연결로 들어갈 위험이 있다. TIME_WAIT과 새 ISN 선택은 이런 연결 세대의 혼동을 줄인다. RFC 9293은 능동적으로 닫힌 연결이 2×MSL 동안 TIME_WAIT에 머물도록 요구하지만, 실제 MSL과 타이머 값은 운영체제와 구현 설정에 따라 다르므로 특정 초 단위 값을 모든 환경에 적용하면 안 된다.

## CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법

`CLOSE_WAIT`은 로컬 TCP가 상대 FIN을 받아 ACK했지만 로컬 애플리케이션의 close 완료를 기다리는 상태다. 이 상태가 계속 늘어난다면 연결 수, 원격 종료 원인과 함께 애플리케이션이 응답·리소스 정리 후 소켓을 닫는 흐름을 추적한다. 즉 CLOSE_WAIT은 네트워크 타이머만 늘려 해결할 문제가 아니라, 로컬 코드가 언제 `close()`를 호출하는지 확인해야 하는 신호다.

`TIME_WAIT`은 보통 active closer가 만든 정상 종료의 흔적이다. 개수가 증가했을 때는 누가 active close를 하는지, 요청량과 짧은 연결 비율, 임시 포트 범위, 커넥션 재사용 정책, 운영체제의 TIME_WAIT 및 재사용 설정을 함께 본다. 2MSL의 실제 시간과 TIME_WAIT 개수만으로 장애라고 단정하지 말고, 포트 고갈·연결 실패·지연·재시도 지표와 배포 또는 트래픽 변화도 함께 비교한다.

## 장점과 한계

3-way handshake는 양쪽의 송수신 가능성과 초기 시퀀스 번호를 확인해 신뢰성 있는 바이트 스트림의 출발점을 만든다. 4-way 종료와 TIME_WAIT은 반대 방향 데이터가 끝나는 시점을 분리하고, 마지막 제어 세그먼트의 재전송과 지연 세그먼트 처리에 여지를 준다. 상태를 보면 애플리케이션 close 흐름과 네트워크 종료 흐름을 구분해 관찰할 수 있다.

반면 연결 수립·종료에는 왕복 지연과 상태 관리 비용이 있고, 짧은 연결이 많으면 TIME_WAIT과 임시 포트 사용량이 눈에 띌 수 있다. SYN, FIN, ACK의 상태 전이는 재전송·동시 종료·RST처럼 다양한 예외 경로를 모두 포괄하는 간략화된 정상 흐름이다. 따라서 운영 판단에서는 상태 수치 하나보다 패킷, 애플리케이션 로그, 소켓 오류, 실제 설정을 함께 확인해야 한다.

## 기술면접 질문

### 3-way handshake가 필요한 이유

3-way handshake는 양쪽이 서로 통신할 수 있고 각자의 초기 시퀀스 번호를 확인했음을 확정합니다. 수신 측의 SYN-ACK는 시작 측 SYN을 `ack=x+1`로 확인하면서 자신의 ISN `y`를 전달합니다. 마지막 ACK가 있어야 수신 측도 현재 연결의 시작 측이 자신의 SYN을 받았다는 사실을 확인해 ESTABLISHED로 이동합니다.

### 4-way handshake에서 FIN과 ACK가 분리되는 이유

TCP는 양방향 바이트 스트림을 독립적으로 닫기 때문에 FIN을 받은 쪽은 먼저 ACK로 그 방향의 종료만 확인할 수 있습니다. 수신 측 애플리케이션은 남은 데이터를 처리하거나 응답을 보낸 뒤에야 자신의 FIN을 보낼 수 있습니다. 그래서 종료 시작 측 FIN에 대한 ACK와 반대 방향 FIN이 서로 다른 시점에 전송되어 보통 네 개의 세그먼트가 됩니다.

### TIME_WAIT이 필요한 이유

TIME_WAIT은 상대가 마지막 ACK를 받지 못해 FIN을 재전송했을 때 active closer가 ACK를 다시 보낼 수 있게 합니다. 또한 이전 연결의 지연 세그먼트가 같은 4-tuple의 새 연결에 섞이는 위험을 줄이는 시간을 제공합니다. RFC 9293의 2MSL 규정은 이 상태의 목적을 설명하지만 실제 기간과 영향은 운영체제 설정 및 트래픽 특성과 함께 판단해야 합니다.

## 복습 체크리스트

- [ ] `SYN seq=x`, `SYN-ACK seq=y ack=x+1`, `ACK ack=y+1`의 ACK 값이 왜 1 증가하는지 설명할 수 있다.
- [ ] 시작 측과 수신 측이 독립적인 ISN을 선택하고, 마지막 ACK가 양방향 확인을 완성함을 설명할 수 있다.
- [ ] FIN을 받은 쪽이 CLOSE_WAIT에서 애플리케이션 close를 기다리므로 ACK와 FIN이 분리될 수 있음을 설명할 수 있다.
- [ ] active closer가 TIME_WAIT에서 마지막 ACK 재전송과 지연 세그먼트 제거를 지원함을 설명할 수 있다.
- [ ] CLOSE_WAIT과 TIME_WAIT을 상태 수치 하나로 장애로 단정하지 않고 역할·트래픽·코드·설정을 함께 점검할 수 있다.

## 참고 자료

- [TCP의 연결성립 : 3-웨이 핸드셰이크 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116078)
- [TCP의 연결해제 : 4-웨이 핸드셰이크와TIME_WAIT ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=130876)
- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)

이전: [TCP와 UDP, 그리고 MTU·MSS·PMTUD](/study/network/tcp-udp-mtu-mss-pmtud/) · [연재 목록](/study/network/)
