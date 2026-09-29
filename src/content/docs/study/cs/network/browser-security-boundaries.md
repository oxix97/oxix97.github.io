---
title: "브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가"
description: 교차 출처 응답 접근, 악성 스크립트 실행, 인증된 요청 위조를 구분하고 각 방어가 적용되는 위치를 정리합니다.
slug: study/network/browser-security-boundaries
contentType: study
publishedAt: 2026-09-29
tags: [Network, Browser, CORS, XSS, CSRF]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 23
---

브라우저에서 요청이 실패하거나 쿠키가 악용될 때 CORS, XSS, CSRF를 한 가지 문제로 묶어 설명하기 쉽다. 세 개는 공격 대상과 적용되는 경계가 다르다. [브라우저 저장소](/study/network/browser-storage-and-cookies/)와 [인증](/study/network/session-vs-token-authentication/)에서 배운 쿠키의 성질을 기준으로 구분해 보자.

## 핵심 요약

- CORS는 서버가 브라우저의 다른 출처 스크립트에 응답 접근을 허용할지 알리는 HTTP 헤더 기반 절차다.
- XSS는 신뢰하지 않은 데이터가 페이지에서 실행 가능한 코드로 해석되는 문제다.
- CSRF는 사용자의 인증 정보가 자동으로 실리는 요청을 악용해 의도하지 않은 동작을 시키는 문제다.
- CORS 설정만으로 CSRF를 막을 수 없고, `HttpOnly` 쿠키만으로 XSS의 모든 피해를 막을 수도 없다.

## 출처와 사이트를 먼저 구분한다

출처는 스킴·호스트·포트의 조합이다. `https://shop.example.com`과 `https://api.example.com`은 호스트가 달라 다른 출처다. 반면 쿠키의 `SameSite`는 출처와 다른 사이트 기준을 사용한다. 두 주소가 다른 출처여도 같은 사이트일 수 있다. 쿠키 전송 문제와 JavaScript의 응답 접근 문제를 섞지 않는 출발점이다.

| 질문 | 해당 개념 | 브라우저에서 보이는 현상 |
| --- | --- | --- |
| 다른 출처의 스크립트가 API 응답을 읽어도 되는가? | 동일 출처 정책·CORS | 응답이 와도 스크립트에 노출되지 않을 수 있다. |
| 게시글 내용이 코드로 실행되는가? | XSS | 공격자 입력이 페이지의 스크립트 권한으로 동작한다. |
| 다른 사이트가 로그인된 사용자의 요청을 유도하는가? | CSRF | 브라우저가 조건에 맞는 쿠키를 자동으로 보낼 수 있다. |

## CORS는 응답 접근 권한을 조정한다

브라우저의 다른 출처 `fetch`는 서버에 도달할 수 있다. CORS는 서버 응답의 허용 헤더를 검사해 그 응답을 호출한 스크립트에 보여 줄지 결정한다. 따라서 “CORS가 모든 교차 출처 요청 전송을 막는다”는 설명은 틀리다. 일부 요청은 실제 요청 전에 `OPTIONS` 사전 요청을 보내 허용 메서드와 필드를 확인한다.

```http
OPTIONS /orders HTTP/1.1
Origin: https://shop.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

서버가 이 출처·메서드·필드를 허용하면 브라우저가 실제 요청을 보낼 수 있다. 쿠키 같은 자격 증명을 포함하는 교차 출처 요청에는 클라이언트의 자격 증명 옵션과 서버의 명시적 허용이 함께 필요하다. 이 경우 허용 출처에 `*`를 쓰는 식으로 임의의 출처를 열어서는 안 된다. **CORS는 인증이나 서버의 접근 제어를 대신하지 않는다.**

## XSS는 데이터가 코드가 되는 경계다

공격자가 올린 게시글을 HTML 문자열로 그대로 삽입하면, 브라우저가 신뢰하지 않은 내용을 코드로 해석할 수 있다. 방어의 기본은 사용자 입력을 출력 위치에 맞게 인코딩하고, 안전한 DOM API를 사용하며, 위험한 HTML 삽입을 피하는 것이다. HTML을 허용해야 한다면 목적에 맞는 검증된 정화 절차가 필요하다.

콘텐츠 보안 정책(CSP)은 피해를 줄이는 추가 방어다. `HttpOnly`는 스크립트가 해당 쿠키 값을 읽지 못하게 하지만, XSS로 실행된 스크립트가 같은 출처에서 사용자의 권한으로 동작하는 문제 전체를 없애지는 못한다.

## CSRF는 자동 전송되는 인증 정보를 악용한다

사용자가 로그인한 상태에서 공격자 페이지를 방문했다고 하자. 공격자가 피해 사이트로 상태 변경 요청을 유도하고, 브라우저가 그 요청에 세션 쿠키를 실어 보낼 수 있다면 서버는 요청자의 의도를 별도로 확인해야 한다. 서버는 상태 변경 요청에 CSRF 토큰을 검증하거나 `Origin` 등의 출처 정보를 검사할 수 있다. 쿠키의 `SameSite`도 위험을 줄이지만 유일한 방어로 가정해서는 안 된다.

CORS 오류가 화면에 나타나더라도, 사전 요청이 필요하지 않은 요청은 서버에 도달해 상태를 바꿨을 수 있다. 그래서 CORS 오류 메시지를 CSRF 방어 성공의 증거로 보면 안 된다. 인증과 인가, 상태 변경에 대한 보호를 서버에서 확인해야 한다.

## 장점과 한계

세 문제의 경계를 분리하면 브라우저 콘솔의 CORS 오류, 위험한 HTML 렌더링, 의도하지 않은 인증 요청을 각각 다른 위치에서 조사할 수 있다. 방어도 응답 헤더, 출력 처리, 서버의 요청 검증에 맞춰 배치할 수 있다.

한 가지 설정으로 모든 공격을 막을 수는 없다. 특히 XSS가 성공하면 같은 출처의 스크립트 권한을 얻어 다른 방어에도 영향을 줄 수 있다. 실제 배포 환경의 쿠키 속성, 프레임워크의 기본 출력 처리, API 인증 방식을 함께 확인해야 한다.

## 기술면접 질문

### CORS는 교차 출처 요청 자체를 차단하는가?

항상 그렇지는 않습니다. 브라우저는 요청을 보낸 뒤 CORS 응답 헤더에 따라 스크립트가 응답을 읽을 수 있는지 판단합니다. 사전 요청이 필요한 경우에는 허용 여부를 먼저 확인하지만, CORS를 서버 인증이나 CSRF 방어로 사용해서는 안 됩니다.

### XSS와 CSRF의 차이는 무엇인가?

XSS는 공격자 입력이 피해 사이트의 페이지에서 코드로 실행되는 문제입니다. CSRF는 사용자의 인증 정보가 자동으로 실리는 요청을 악용해 의도하지 않은 동작을 유도합니다. 각각 출력 처리와 서버의 상태 변경 요청 검증이 핵심 방어입니다.

### HttpOnly와 SameSite만 설정하면 충분한가?

충분하지 않습니다. HttpOnly는 스크립트의 쿠키 값 읽기를 막지만 XSS 스크립트의 모든 행동을 막지는 못합니다. SameSite는 교차 사이트 쿠키 전송을 제한하지만 요청의 의도 확인을 대체하지 않으므로 필요한 경우 CSRF 토큰이나 출처 검증을 함께 사용합니다.

## 복습 체크리스트

- [ ] 출처와 사이트의 차이를 예시 주소로 설명할 수 있다.
- [ ] CORS 오류가 요청 미전송을 뜻하지 않을 수 있는 이유를 설명할 수 있다.
- [ ] XSS에서 데이터가 코드로 바뀌는 지점을 찾을 수 있다.
- [ ] 쿠키가 실린 상태 변경 요청에 CSRF 방어가 필요한 이유를 설명할 수 있다.
- [ ] CORS·XSS·CSRF의 방어가 각각 어디에 적용되는지 구분할 수 있다.

## 참고 자료

- [CORS란 무엇인가요? ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=197977)
- [XSS가 무엇인가요? ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=291041)
- [CSRF가 무엇인가요? ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=291042)
- [MDN: Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [OWASP: Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP: Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

이전: [트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가](/study/network/traffic-overload-and-bottlenecks/) · [연재 목록](/study/network/) · 다음: [브라우저 렌더링: HTML에서 화면까지](/study/network/browser-rendering/)
