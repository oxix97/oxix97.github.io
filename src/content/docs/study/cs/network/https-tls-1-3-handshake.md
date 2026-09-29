---
title: "TLS 1.3 핸드셰이크는 연결 키를 어떻게 만드는가"
description: TLS 1.3이 키를 합의하고 서버를 인증해 암호화된 연결을 시작하는 흐름을 정리합니다.
slug: study/network/https-tls-1-3-handshake
contentType: study
publishedAt: 2026-08-14
tags: [Network, HTTPS, TLS, Handshake]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 17
---

TLS 핸드셰이크를 메시지 이름만 외우면 암호화 키와 서버 인증이 어떻게 결합하는지 설명하기 어렵다. 클라이언트와 서버가 합의하는 정보, 인증서 검증, 트래픽 키 파생을 한 흐름으로 정리한다. 대칭키·공개키·인증서의 기본 역할은 [앞 글](/study/network/https-cryptography-and-certificates/)에서 먼저 확인할 수 있다.

## 핵심 요약

- ClientHello와 ServerHello는 지원하는 매개변수와 키 공유 값을 교환한다.
- ECDHE는 공유 비밀을 협의하고, HKDF는 이를 TLS 트래픽 키로 파생한다.
- 인증서는 서버의 공개키와 신원을 연결하고 CertificateVerify는 서버의 개인키 소유를 증명한다.
- TLS 1.3의 0-RTT는 재개 연결을 빠르게 할 수 있지만 replay 위험이 있어 애플리케이션의 제한이 필요하다.

## 핸드셰이크는 협상·인증·키 설정을 이어 간다

클라이언트는 ClientHello에 지원하는 TLS 버전, 암호 스위트, 키 공유 값 등을 담는다. 서버는 선택한 설정과 키 공유 값을 ServerHello로 응답한다. 두 쪽은 ECDHE 공개값으로 같은 공유 비밀을 계산할 수 있으며 비밀 자체를 네트워크에 보내지는 않는다. ECDHE 공유 비밀은 그대로 암호화 키로 쓰지 않으며, HKDF로 여러 트래픽 키를 파생한다.

TLS 1.3 기본 핸드셰이크 흐름을 단순화하면 다음과 같다.

```text
ClientHello (지원 설정, key share)  →
                         ← ServerHello (선택 설정, key share)
                         ← EncryptedExtensions
                         ← Certificate, CertificateVerify, Finished
Finished                  →
이후 애플리케이션 데이터는 협상된 트래픽 키로 보호
```

ServerHello 뒤의 메시지는 핸드셰이크 트래픽 키로 보호된다. Certificate는 인증서 체인을 전달하고, CertificateVerify는 서버가 해당 연결의 핸드셰이크 내용에 서명할 개인키를 소유했음을 증명한다. Finished는 핸드셰이크 메시지에 대한 검증값으로 협상 내용이 바뀌지 않았는지 확인한다.

**키 합의는 상대 신원을 증명하지 않는다. 키 합의와 인증서 검증을 함께 해야 한다.**

<figure class="study-diagram">
  <img
    src="/images/study/network/http/tls-1-3-handshake.svg"
    alt="클라이언트와 서버가 ClientHello와 ServerHello로 ECDHE key share를 교환하고 인증서와 CertificateVerify 및 Finished를 검증한 뒤 애플리케이션 데이터를 암호화하는 TLS 1.3 흐름도"
    loading="lazy"
  />
  <figcaption>인증서 기반 TLS 1.3 전체 핸드셰이크의 대표 흐름이며 HelloRetryRequest, 클라이언트 인증, 재개 연결은 생략했다.</figcaption>
</figure>

## 인증서 검증과 트래픽 키 파생

클라이언트는 인증서의 서명 체인을 신뢰 앵커까지 검증하고, 요청한 서버 이름이 인증서의 신원과 맞는지 확인한다. 연결에서 받은 인증서가 유효해 보이는 것만으로 충분하지 않으며 이름 검증과 유효 기간, 용도도 확인해야 한다.

ECDHE로 얻은 공유 비밀은 그대로 데이터 암호화 키로 쓰지 않는다. TLS 1.3은 핸드셰이크 transcript와 HKDF를 이용해 핸드셰이크 키와 애플리케이션 트래픽 키를 파생한다. 과거 세션의 임시 개인값이 폐기되면 인증서 개인키가 나중에 유출되더라도 과거 세션 키를 바로 복원하기 어렵다.

<figure class="study-diagram study-diagram-compact">
  <img
    src="/images/study/network/reading/tls-key-derivation.svg"
    width="480"
    height="870"
    alt="양쪽이 공개 key share만 교환해 공유 비밀을 각각 계산하고 HKDF로 핸드셰이크와 애플리케이션의 방향별 트래픽 키를 파생하는 흐름"
    loading="lazy"
  />
  <figcaption>인증서 기반 ECDHE 전체 핸드셰이크의 개념도다. PSK 입력과 세부 파생 단계 등 전체 키 스케줄은 생략했다.</figcaption>
</figure>

## 0-RTT는 지연과 replay 위험을 함께 가진다

서버와 이전에 연결한 클라이언트는 PSK를 이용해 연결을 재개하고 early data를 ClientHello와 함께 보낼 수 있다. 이를 0-RTT 데이터라고 부른다. 재개 요청에서 왕복 대기를 줄이는 대신, 서버는 동일한 early data를 다시 받을 수 있는 replay 위험을 고려해야 한다.

0-RTT 데이터는 완전한 forward secrecy를 얻기 전에 전송된다. 따라서 서버는 반복 처리돼도 안전한 요청만 허용하거나 별도 중복 방지 정책을 적용해야 한다. 모든 요청에 0-RTT를 허용해도 안전하다고 보면 안 된다.

## 장점과 한계

TLS 1.3은 핸드셰이크 메시지 수를 줄이고 키 합의와 서버 인증을 연결한다. ECDHE 키 합의는 인증서 개인키와 세션 데이터 암호화 키를 분리해 과거 트래픽 보호에 도움을 준다.

인증서는 신뢰 저장소와 이름 검증이 올바를 때 서버 신원을 보증한다. 0-RTT는 replay 위험을 애플리케이션에 남기며, 실제 핸드셰이크는 재개 여부와 클라이언트 인증 설정에 따라 달라질 수 있다.

## 기술면접 질문

### TLS 1.3 핸드셰이크는 어떤 일을 하는가?

클라이언트와 서버가 암호 설정과 키 공유 값을 협상하고, 서버 인증서를 확인한 뒤 트래픽 보호 키를 파생합니다. Finished 검증으로 핸드셰이크 내용의 무결성도 확인합니다. 키 합의와 서버 인증은 서로 다른 절차입니다.

### ECDHE와 서버 인증서는 각각 어떤 역할을 하는가?

ECDHE는 통신 양쪽이 세션 공유 비밀을 계산하도록 돕고, 인증서는 공개키와 서버 신원을 연결합니다. CertificateVerify는 서버가 인증서에 대응하는 개인키를 소유했음을 증명합니다. 공개키를 받는 것만으로는 요청한 서버인지 확인되지 않습니다.

### TLS 1.3의 0-RTT는 왜 주의해야 하는가?

이전 연결의 PSK로 재개할 때 애플리케이션 데이터를 핸드셰이크 완료 전에 보낼 수 있어 왕복 지연을 줄입니다. 같은 데이터가 다시 처리될 수 있는 replay 위험이 있고 완전한 forward secrecy도 보장하지 않습니다. 반복 실행에 안전한 요청만 허용하도록 서버 정책을 설계해야 합니다.

## 복습 체크리스트

- [ ] ClientHello와 ServerHello가 협상하는 정보를 설명할 수 있다.
- [ ] ECDHE 키 합의와 인증서 기반 서버 인증의 차이를 설명할 수 있다.
- [ ] CertificateVerify와 Finished가 확인하는 것을 구분할 수 있다.
- [ ] 인증서 체인과 서버 이름 검증이 모두 필요한 이유를 설명할 수 있다.
- [ ] 0-RTT의 지연 이점과 replay 위험을 함께 설명할 수 있다.

## 참고 자료

- [DEEP DIVE : HTTPS와 TLS #2. TLS 핸드셰이크 ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=129789)
- [RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 5280: Internet X.509 Public Key Infrastructure Certificate and CRL Profile](https://www.rfc-editor.org/rfc/rfc5280)
- [RFC 9525: Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525)

이전: [HTTPS 암호화와 인증서: 기밀성·키 합의·서버 인증](/study/network/https-cryptography-and-certificates/) · [연재 목록](/study/network/) · 다음: [브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교](/study/network/browser-storage-and-cookies/)
