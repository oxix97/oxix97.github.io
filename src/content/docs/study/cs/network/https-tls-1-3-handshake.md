---
title: "HTTPS는 어떻게 안전한 연결을 만드는가: TLS 1.3 핸드셰이크"
description: 대칭키 암호와 공개키 인증의 역할을 구분하고 ECDHE, 인증서 검증, 키 파생으로 이어지는 TLS 1.3 핸드셰이크를 정리합니다.
slug: study/network/https-tls-1-3-handshake
contentType: study
publishedAt: 2026-08-14
tags: [Network, HTTPS, TLS, Security]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 12
---

HTTPS를 "공개키로 HTTP를 암호화한다"고만 설명하면 실제 연결에서 키 합의와 인증, 데이터 보호가 어떻게 나뉘는지 알기 어렵다. TLS 1.3 핸드셰이크를 따라가면 각 암호 기술이 언제 쓰이고 무엇을 보장하는지 구분할 수 있다.

## 핵심 요약

- HTTPS는 HTTP 의미를 TLS로 보호해 기밀성과 무결성, 일반적으로 서버 인증을 제공한다.
- ECDHE는 공개된 key share를 교환해 같은 공유 비밀을 계산한다. 공유 비밀 자체를 네트워크로 보내지는 않는다.
- 서버 인증서와 `CertificateVerify`는 서버가 인증서의 개인키를 가지고 있음을 증명한다.
- TLS 1.3은 ECDHE 결과와 핸드셰이크 transcript를 HKDF에 넣어 방향과 단계가 다른 트래픽 키를 파생한다.
- 0-RTT는 재개 연결의 지연을 줄이지만 replay와 forward secrecy에서 일반적인 1-RTT 데이터보다 약한 성질을 가진다.

## HTTPS에서 암호 기술이 맡는 역할

대칭키 암호는 암호화와 복호화에 같은 비밀키를 사용한다. 계산 비용이 비교적 작아 연결이 만들어진 뒤 애플리케이션 데이터를 보호하는 데 적합하다. TLS 1.3은 AES-GCM이나 ChaCha20-Poly1305 같은 AEAD 알고리즘으로 기밀성과 무결성을 함께 제공한다.

공개키 암호라는 이름 아래에는 서로 다른 작업이 들어 있다. ECDHE는 두 종단이 공개 key share를 교환하고 같은 공유 비밀을 계산하는 키 합의다. 전자 서명은 개인키 소유자가 메시지에 서명하고 공개키 소유자가 이를 검증하는 인증 수단이다. 인증서는 공개키와 서비스 신원을 연결한다.

| 기술 | TLS 1.3에서 맡는 일 | 직접 네트워크로 보내는 값 |
| --- | --- | --- |
| ECDHE | 클라이언트와 서버가 공유 비밀을 합의 | 각자의 임시 공개 key share |
| 전자 서명 | 인증서 개인키 소유와 핸드셰이크 transcript를 인증 | `CertificateVerify` 서명 |
| HKDF | 공유 비밀과 transcript에서 단계별 트래픽 비밀·키 파생 | 파생한 비밀과 키는 보내지 않음 |
| AEAD | 핸드셰이크 이후 레코드의 기밀성과 무결성 보호 | 암호문과 인증 태그 |

**TLS 1.3은 한 가지 암호 방식으로 모든 일을 처리하지 않는다. 키 합의, 인증, 키 파생, 데이터 보호를 서로 다른 장치에 맡긴다.**

## TLS 1.3 핸드셰이크가 확인하는 것

핸드셰이크는 사용할 TLS 버전과 암호 조합을 정하고, 서버를 인증하며, 이후 통신에 쓸 키를 만든다. 다음 흐름은 인증서로 서버를 인증하는 일반적인 전체 1-RTT 핸드셰이크다. HelloRetryRequest, 클라이언트 인증, 재개 연결은 우선 제외한다.

### ClientHello와 ServerHello

클라이언트는 `ClientHello`에 지원하는 TLS 버전, cipher suite 목록, 임시 ECDHE key share 등을 담아 보낸다. `supported_versions` 확장으로 TLS 1.3 지원을 알리고, `key_share` 확장으로 선택 가능한 그룹의 공개값을 제시한다.

서버는 공통으로 지원하는 버전과 cipher suite를 선택한다. 클라이언트가 보낸 key share를 사용할 수 있다면 서버의 임시 key share와 함께 `ServerHello`를 보낸다. 적절한 key share가 없다면 HelloRetryRequest로 다른 그룹의 값을 다시 요구할 수 있다.

두 종단은 상대의 공개 key share와 자신의 임시 개인값으로 같은 ECDHE 공유 비밀을 계산한다. 그 다음 HKDF 키 스케줄이 핸드셰이크 트래픽 비밀과 키를 파생한다. `ServerHello` 뒤의 핸드셰이크 메시지는 이 키로 보호된다.

### EncryptedExtensions부터 Finished까지

서버는 `EncryptedExtensions`에 `ServerHello`에서 확정하지 않은 확장 협상 결과를 담는다. 인증서를 사용하는 전체 핸드셰이크라면 이어서 `Certificate`와 `CertificateVerify`를 보낸다.

`Certificate`는 서버 인증서와 필요한 중간 인증서 체인을 전달한다. `CertificateVerify`는 서버가 현재 핸드셰이크 transcript에 인증서 개인키로 서명한 값이다. 인증서 파일만 복사한 상대가 아니라 해당 개인키를 가진 상대가 지금 핸드셰이크에 참여했음을 확인한다.

서버의 `Finished`는 지금까지의 핸드셰이크 transcript와 파생된 키를 바탕으로 계산된다. 클라이언트는 인증서와 서명, `Finished`를 검증한 뒤 자신의 `Finished`를 보낸다. 양쪽은 이후 애플리케이션 트래픽 키로 HTTP 데이터를 보호한다.

<figure class="study-diagram">
  <img
    src="/images/study/network/http/tls-1-3-handshake.svg"
    alt="클라이언트와 서버가 ClientHello와 ServerHello로 ECDHE key share를 교환하고 인증서와 CertificateVerify 및 Finished를 검증한 뒤 애플리케이션 데이터를 암호화하는 TLS 1.3 흐름도"
    loading="lazy"
  />
  <figcaption>인증서 기반 TLS 1.3 전체 핸드셰이크의 대표 흐름이며 HelloRetryRequest, 클라이언트 인증, 재개 연결은 생략했다.</figcaption>
</figure>

## 인증서 검증과 서버 인증

인증서 검증은 CA의 공개키로 서명 하나만 확인하는 작업보다 범위가 넓다. 클라이언트는 서버 인증서부터 신뢰하는 루트까지 인증 경로를 만들고 각 인증서의 서명, 유효 기간, Basic Constraints, Key Usage 같은 제약을 확인한다. 로컬 신뢰 저장소의 루트 인증서는 경로 검증의 trust anchor가 된다.

경로가 유효해도 접속한 서비스 이름과 인증서가 다르면 연결을 신뢰할 수 없다. 현재 TLS 서비스 신원 검증 지침은 클라이언트가 참조 식별자를 인증서의 `subjectAltName` 식별자와 대조하도록 요구한다. 와일드카드가 모든 위치와 깊이의 하위 도메인을 뜻하는 것도 아니다.

인증서 체인 검증은 공개키를 신뢰할 근거를 만든다. `CertificateVerify`는 현재 서버가 그 공개키에 대응하는 개인키를 가졌음을 증명한다. `Finished`는 핸드셰이크 메시지가 중간에 바뀌지 않았고 양쪽이 올바른 키를 계산했는지 확인한다.

**인증서가 유효하다는 사실과 현재 서버가 개인키를 소유한다는 사실, 접속한 이름이 인증서와 일치한다는 사실을 모두 확인해야 서버 인증이 완성된다.**

## ECDHE와 HKDF로 트래픽 키를 만드는 과정

ECDHE의 `E`는 Ephemeral을 뜻한다. 연결마다 임시 키 쌍을 만들고 공개 key share만 교환한다. 관찰자는 두 공개값을 볼 수 있어도 임시 개인값 없이 같은 공유 비밀을 계산하기 어렵다.

공유 비밀을 그대로 하나의 세션키로 쓰지는 않는다. TLS 1.3 키 스케줄은 HKDF-Extract와 HKDF-Expand-Label을 사용해 핸드셰이크 트래픽 비밀, 애플리케이션 트래픽 비밀, 실제 레코드 보호 키와 IV를 단계별로 파생한다. 클라이언트 송신과 서버 송신의 비밀도 분리한다.

키 파생에는 핸드셰이크 transcript의 해시가 문맥으로 들어간다. 중간자가 버전, cipher suite, key share 같은 협상 내용을 바꾸면 양쪽의 transcript와 검증 값이 일치하지 않는다. `Finished`는 이런 변조를 탐지하는 마지막 단계 중 하나다.

연결 뒤 임시 개인값과 이전 트래픽 비밀을 지우면 나중에 인증서 개인키가 유출돼도 과거에 기록한 세션을 그 키만으로 복호화할 수 없다. 이를 forward secrecy라고 한다. 현재 연결의 트래픽 비밀 자체가 노출된 경우까지 보호하는 성질은 아니다.

## TLS 1.3 cipher suite를 읽는 방법

`TLS_AES_128_GCM_SHA256`을 예로 들면 `AES_128_GCM`은 레코드를 보호하는 AEAD 알고리즘이고 `SHA256`은 HKDF와 transcript 해시에 사용하는 해시 함수다. TLS 1.2의 cipher suite 이름에는 키 교환과 서명 알고리즘까지 함께 들어가는 경우가 많았다.

TLS 1.3은 cipher suite에서 키 교환과 인증 알고리즘을 분리했다. ECDHE 그룹은 `supported_groups`와 `key_share`로, 서명 알고리즘은 `signature_algorithms`로 협상한다. 따라서 `TLS_AES_128_GCM_SHA256`만 보고 인증서가 RSA인지 ECDSA인지 결정할 수 없다.

AEAD는 평문을 숨기는 기밀성과 데이터가 바뀌지 않았는지 확인하는 무결성을 함께 제공한다. TLS 1.3은 정적 RSA와 정적 Diffie-Hellman cipher suite를 제거했다. 다만 RSA 인증서와 RSA-PSS 서명은 사용할 수 있으므로 "TLS 1.3에서 RSA가 완전히 사라졌다"고 표현하면 안 된다.

## 정적 RSA 키 교환과 ECDHE의 차이

이전 TLS의 정적 RSA 키 교환에서는 클라이언트가 pre-master secret을 서버 인증서의 RSA 공개키로 암호화해 보냈다. 서버는 장기 개인키로 이를 복호화했다. 공격자가 암호화된 과거 트래픽을 저장해 두고 나중에 서버 개인키까지 얻으면 과거 세션의 비밀을 복구할 수 있었다.

ECDHE에서는 양쪽이 공개값을 교환한 뒤 각자 공유 비밀을 계산한다. 인증서 개인키는 ECDHE 공개값과 transcript에 서명해 서버를 인증하지만 공유 비밀을 복호화하는 데 쓰지 않는다. 임시 개인값을 폐기하면 장기 인증서 키의 사후 유출이 과거 세션 키를 곧바로 드러내지 않는다.

**TLS 1.3의 서버 인증키와 ECDHE 임시 키는 수명과 역할이 다르다. 장기 키는 신원을 증명하고 임시 키는 연결마다 새로운 공유 비밀을 만든다.**

## 0-RTT는 무엇을 줄이고 무엇을 포기하는가

TLS 1.3 연결을 정상적으로 마치면 서버는 이후 재개에 쓸 PSK 정보를 담은 NewSessionTicket을 보낼 수 있다. 클라이언트는 다음 연결의 `ClientHello`에 PSK 식별자와 `early_data` 확장을 넣고, 서버 응답을 받기 전에 애플리케이션 데이터를 보낼 수 있다. 이 데이터가 0-RTT early data다.

0-RTT는 전체 핸드셰이크를 없애는 기능이 아니다. 핸드셰이크는 계속 진행되며 서버가 early data를 거절하면 애플리케이션 정책에 따라 다시 전송해야 할 수 있다. 클라이언트는 서버가 0-RTT를 받아들일 것이라고 가정해서는 안 된다.

early data의 키는 제시한 PSK에서 파생되며 `ServerHello`에 의존하지 않는다. 일반적인 1-RTT 데이터와 달리 완전한 forward secrecy가 없고, TLS만으로 연결 사이의 replay를 보장해 막을 수 없다. 서버의 상태를 바꾸는 주문이나 결제 요청처럼 반복 실행이 위험한 동작을 아무 조건 없이 0-RTT로 보내면 안 된다.

애플리케이션 프로토콜은 어떤 메시지가 replay돼도 안전한지 정하고 서버의 anti-replay 정책과 재시도 동작을 함께 설계해야 한다. 멱등 메서드라는 이름만으로 자원 고갈이나 타이밍 공격까지 모두 안전해지는 것도 아니다.

## 장점과 한계

TLS 1.3은 핸드셰이크에서 버전과 알고리즘을 협상하고 인증서로 서버를 인증한다. ECDHE와 HKDF는 연결별 트래픽 키를 만들며 AEAD는 이후 HTTP 메시지의 기밀성과 무결성을 보호한다. 정적 RSA 키 교환을 제거해 인증서 개인키가 나중에 유출될 때 과거 세션까지 함께 드러나는 위험도 줄였다.

TLS가 보호하는 범위는 연결 안의 데이터다. 통신 상대의 IP 주소, 패킷 크기, 전송 시점 같은 메타데이터까지 모두 숨기지는 않는다. 인증서는 해당 서비스 이름과 공개키의 연결을 검증할 근거이지 서비스의 사업적 신뢰성이나 애플리케이션 권한을 보증하는 문서도 아니다.

인증서 만료, 잘못된 시스템 시간, 누락된 중간 인증서, 서비스 이름 불일치는 핸드셰이크 실패로 이어질 수 있다. 0-RTT와 세션 재개는 지연을 줄이는 대신 별도의 replay·재시도 정책을 요구한다. 운영에서는 TLS 오류 로그와 인증서 경로, 협상된 버전·cipher suite, 시간 동기화를 함께 확인한다.

## 기술면접 질문

### TLS 1.3 핸드셰이크는 무엇을 하는가?

TLS 1.3 핸드셰이크는 사용할 버전과 암호 조합을 협상하고 서버를 인증하며 애플리케이션 데이터를 보호할 키를 만듭니다. ClientHello와 ServerHello의 ECDHE key share로 공유 비밀을 계산하고 인증서, CertificateVerify, Finished를 검증합니다. 이후 방향별 애플리케이션 트래픽 키와 AEAD를 사용해 HTTP 메시지의 기밀성과 무결성을 보호합니다.

### ECDHE와 서버 인증서는 각각 어떤 역할을 하는가?

ECDHE는 클라이언트와 서버가 임시 공개값을 교환해 네트워크로 직접 보내지 않은 공유 비밀을 계산하는 키 합의입니다. 서버 인증서와 CertificateVerify는 현재 서버가 신뢰 경로에 연결된 인증서 개인키를 소유하고 있음을 증명합니다. 장기 인증키와 임시 ECDHE 키를 분리하므로 인증서 개인키가 나중에 유출돼도 과거 세션 키가 바로 복구되지 않는 forward secrecy를 얻습니다.

### TLS 1.3의 0-RTT는 왜 주의해야 하는가?

0-RTT는 이전 연결에서 얻은 PSK로 ClientHello와 함께 early data를 보내 재개 연결의 지연을 줄입니다. 이 데이터는 완전한 forward secrecy가 없고 연결 사이의 replay를 TLS만으로 보장해 막을 수 없습니다. 애플리케이션은 반복 실행돼도 안전한 메시지만 허용하고 서버 거절과 재시도 정책을 명시해야 합니다.

## 복습 체크리스트

- [ ] 대칭키 데이터 보호, ECDHE 키 합의, 전자 서명의 역할을 구분할 수 있다.
- [ ] ClientHello와 ServerHello가 협상하는 정보와 key share의 의미를 설명할 수 있다.
- [ ] Certificate, CertificateVerify, Finished가 각각 무엇을 확인하는지 설명할 수 있다.
- [ ] 인증서 경로 검증과 서비스 이름 검증을 구분할 수 있다.
- [ ] ECDHE 공유 비밀을 그대로 보내지 않고 HKDF로 여러 트래픽 키를 파생함을 설명할 수 있다.
- [ ] TLS 1.3 cipher suite에서 AEAD와 해시를 읽고 키 교환·서명 협상과 구분할 수 있다.
- [ ] 정적 RSA 키 교환과 ECDHE의 forward secrecy 차이를 설명할 수 있다.
- [ ] 0-RTT가 전체 핸드셰이크를 없애지 않으며 replay 위험이 있음을 설명할 수 있다.

## 참고 자료

- [DEEP DIVE : HTTPS와 TLS #1. 암호화  ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116071)
- [DEEP DIVE : HTTPS와 TLS #2. TLS 핸드셰이크 ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=129789)
- [RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 5280: Internet X.509 Public Key Infrastructure Certificate and CRL Profile](https://www.rfc-editor.org/rfc/rfc5280)
- [RFC 9525: Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525)

이전: [HTTP는 버전이 바뀌며 무엇을 해결했는가: 헤더부터 HTTP/3까지](/study/network/http-headers-and-versions/) · [연재 목록](/study/network/)
