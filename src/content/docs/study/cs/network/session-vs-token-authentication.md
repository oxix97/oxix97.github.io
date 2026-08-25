---
title: "로그인 상태는 어디에 저장되는가: 세션 인증과 토큰 인증 비교"
description: 세션 기반 인증과 토큰 기반 인증의 상태 저장 위치, 요청 흐름, 로그아웃과 탈취 대응 방식을 비교합니다.
slug: study/network/session-vs-token-authentication
contentType: study
publishedAt: 2026-08-25
tags: [Network, Authentication, Session, JWT]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 14
---

세션 기반 인증과 토큰 기반 인증을 비교할 때 상태를 누가 보관하는지가 헷갈렸다. 로그인 뒤 클라이언트가 보내는 값과 서버가 확인하는 대상을 기준으로 두 방식을 다시 정리했다.

## 핵심 요약

- 세션 기반 인증은 서버가 사용자 상태를 보관하고, 클라이언트는 그 상태를 찾을 세션 ID를 보낸다.
- 토큰 기반 인증은 클라이언트가 Access Token을 보내고, 서버는 토큰의 유효성과 권한을 확인한다. Access Token이 항상 JWT인 것은 아니다.
- 서명된 JWT의 페이로드는 암호문이 아니다. 서명은 변조 여부를 검증하지만 내용을 숨기지 않는다.
- 짧은 수명의 Access Token은 탈취 피해 시간을 줄인다. Refresh Token은 편의를 위한 자격 증명이므로 더 엄격하게 보호해야 한다.
- 토큰을 검증할 때 세션 저장소를 조회하지 않을 수는 있다. 하지만 폐기 목록이나 Refresh Token 회전을 운영하면 서버 상태가 다시 필요하다.

## HTTP가 요청 사이의 로그인 상태를 기억하지 않는 이유

HTTP 요청은 각각 독립적으로 처리된다. 로그인에 성공해도 다음 요청이 같은 사용자의 것인지는 HTTP 메시지만으로 알 수 없다. 그래서 요청을 연결할 식별 수단이 필요하다.

세션 방식은 서버가 로그인 상태를 저장하고 세션 ID로 찾는다. 토큰 방식은 요청에 함께 온 토큰을 검증해 사용자와 권한을 판단한다. 둘 다 매 요청에 자격 증명을 보내지만, 그 값이 가리키는 상태의 위치가 다르다.

인증과 인가도 구분해야 한다. 로그인은 사용자가 누구인지 확인하는 인증이다. 인증 뒤 특정 자원에 접근할 수 있는지 판단하는 과정은 인가다. 세션이나 Access Token은 이미 인증된 주체를 후속 요청에서 식별하고 인가 판단에 연결하는 수단이다.

**세션과 토큰의 차이는 브라우저에 무엇을 저장하느냐보다 서버가 요청을 검증할 때 무엇을 조회하느냐에서 드러난다.**

## 세션 기반 인증은 서버가 상태를 보관한다

사용자가 자격 증명을 제출하면 서버는 이를 확인한 뒤 세션을 만든다. 세션 저장소에는 사용자 식별자와 필요한 상태를 넣고, 클라이언트에는 이 세션을 찾을 수 있는 임의의 세션 ID만 전달한다.

```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/json

{"username":"user","password":"password"}
```

```http
HTTP/1.1 204 No Content
Set-Cookie: sessionId=opaque-id; Path=/; Secure; HttpOnly; SameSite=Lax
```

브라우저는 적용 조건이 맞는 후속 요청에 쿠키를 자동으로 넣는다. 서버는 `sessionId`를 키로 세션 저장소를 조회한다. 세션이 살아 있고 요청에 필요한 권한이 있으면 처리를 계속한다.

```http
GET /me HTTP/1.1
Host: example.com
Cookie: sessionId=opaque-id
```

세션 ID는 사용자 정보 자체가 아니다. 충분히 예측하기 어려워야 하고 로그인 성공처럼 권한이 바뀌는 시점에는 새 값으로 교체해야 한다. 로그아웃할 때는 서버 저장소의 세션을 지우고 쿠키도 만료시킨다.

Express의 `express-session`도 세션 데이터가 아니라 세션 ID만 쿠키에 저장한다. `secret` 옵션은 이 세션 ID 쿠키에 서명할 때 쓴다. 세션 ID를 생성하는 단순한 씨앗으로 설명하면 실제 역할을 놓치게 된다.

서버가 여러 대라면 어느 서버에서도 같은 세션을 찾을 수 있어야 한다. 공유 세션 저장소를 두거나, 요청을 같은 서버로 보내는 전략이 필요하다. 저장소 장애와 만료 정책도 인증 흐름의 일부가 된다.

**세션 ID만으로 사용자를 신뢰하지 않는다. 서버 저장소에서 유효한 세션을 찾았을 때 로그인 상태가 이어진다.**

## JWT 기반 Access Token은 클라이언트가 증표를 보낸다

토큰 기반 인증에서 클라이언트는 로그인 뒤 Access Token을 받는다. 보호된 자원을 요청할 때는 보통 `Authorization` 필드의 `Bearer` 인증 스킴으로 토큰을 전달한다.

```http
GET /me HTTP/1.1
Host: api.example.com
Authorization: Bearer access-token
```

Bearer Token은 그 값을 가진 주체가 사용할 수 있는 자격 증명이다. 서버는 TLS로 전송 구간을 보호하고 토큰이 URL에 남지 않게 해야 한다. URL은 브라우저 기록, 서버 로그, 중간 시스템에 기록될 수 있다.

Access Token의 형식은 하나로 정해져 있지 않다. 서버가 저장소에서 조회하는 불투명 토큰을 쓸 수도 있고, 검증에 필요한 클레임을 담은 JWT를 쓸 수도 있다. JWT는 토큰 형식이지 토큰 기반 인증 전체를 뜻하는 말이 아니다.

서명된 JWT를 JWS Compact Serialization으로 표현하면 보통 세 부분으로 보인다.

```text
base64url(header).base64url(payload).base64url(signature)
```

헤더에는 서명 알고리즘 같은 메타데이터가 들어간다. 페이로드에는 `iss`, `sub`, `aud`, `exp` 같은 클레임을 넣을 수 있다. 서명이나 MAC은 헤더와 페이로드가 발급 뒤 바뀌지 않았는지 검증한다.

Base64url 인코딩은 암호화가 아니다. 서명된 JWT의 페이로드는 토큰을 가진 사람이 디코딩해 읽을 수 있다. 비밀번호나 개인정보처럼 노출되면 안 되는 값은 넣지 않아야 한다. 내용까지 숨기려면 JWE 같은 별도의 암호화 형식이 필요하다.

서버는 서명만 맞는다고 토큰을 받아들이면 안 된다. 허용한 알고리즘인지 확인하고, 발급자와 대상 서비스가 맞는지 검증해야 한다. 만료 시각과 애플리케이션이 요구하는 클레임도 함께 확인한다.

**JWT를 디코딩한 결과는 검증 결과가 아니다. 서명과 알고리즘, 발급자, 대상, 만료 조건을 확인한 뒤에만 클레임을 사용한다.**

## Access Token과 Refresh Token을 나누는 이유

Access Token을 오래 유지하면 로그인 횟수는 줄어든다. 대신 토큰이 탈취됐을 때 공격자가 사용할 수 있는 시간도 길어진다. Access Token의 수명을 짧게 두면 피해 가능 시간을 줄일 수 있지만, 만료될 때마다 사용자에게 로그인을 요구하기는 어렵다.

그래서 Refresh Token을 함께 쓴다. 클라이언트는 수명이 짧은 Access Token으로 자원 서버에 요청한다. Access Token이 만료되면 Refresh Token을 인증 서버에 보내 새 Access Token을 받는다.

```http
POST /token/refresh HTTP/1.1
Host: auth.example.com
Cookie: refreshToken=refresh-credential
```

Refresh Token은 Access Token을 계속 발급받을 수 있으므로 탈취됐을 때 영향이 더 오래간다. 전송과 저장 과정에서 기밀성을 지켜야 하고, 발급한 클라이언트와 권한 범위에 묶어야 한다. 일정 기간 사용하지 않은 Refresh Token을 만료시키거나 로그아웃과 비밀번호 변경 시 폐기하는 정책도 필요하다.

공개 클라이언트에서 Refresh Token을 발급한다면 탈취한 토큰의 재사용을 탐지할 장치가 필요하다. RFC 9700은 송신자 제약 토큰이나 Refresh Token 회전을 제시한다. 회전 방식은 갱신할 때마다 새 Refresh Token을 발급하고 이전 값을 무효화한다. 이미 무효화된 값이 다시 들어오면 토큰 유출 가능성을 감지할 수 있다.

Refresh Token을 도입했다고 서버가 항상 무상태가 되는 것은 아니다. 회전 관계와 폐기 상태를 확인하려면 인증 서버가 정보를 보관해야 한다. Access Token 검증에서 매번 사용자 세션을 조회하지 않는다는 의미와 인증 시스템 전체에 상태가 없다는 말은 다르다.

**Refresh Token은 Access Token 탈취를 막지 않는다. Access Token의 노출 시간을 줄이면서 재로그인 횟수를 낮추는 대신, 별도의 보호와 폐기 정책을 요구한다.**

## 세션과 토큰의 인증 흐름 비교

두 흐름을 나란히 보면 클라이언트가 보내는 값과 서버가 조회하는 대상이 갈린다. 세션 서버는 세션 ID로 저장소를 찾고, 자원 서버는 Access Token의 유효성을 확인한다.

<figure class="study-diagram">
  <img
    src="/images/study/network/http/session-token-auth-flow.svg"
    alt="세션 기반 인증은 세션 ID로 서버 저장소를 조회하고 토큰 기반 인증은 Authorization 헤더의 Access Token을 검증한 뒤 Refresh Token으로 갱신하는 흐름 비교"
    loading="lazy"
  />
  <figcaption>세션 방식은 서버 저장소의 상태를 찾고, 토큰 방식은 Access Token을 검증한다. Refresh Token 회전과 폐기를 사용하면 인증 서버에도 상태가 생긴다.</figcaption>
</figure>

선택 기준을 표로 묶어 보면 다음과 같다.

| 비교 기준 | 세션 기반 인증 | 토큰 기반 인증 |
| --- | --- | --- |
| 서버가 확인하는 값 | 세션 ID로 찾은 서버 측 상태 | Access Token의 유효성·클레임 또는 불투명 토큰 조회 결과 |
| 클라이언트가 보관하는 값 | 보통 쿠키의 세션 ID | Access Token, 필요하면 Refresh Token |
| 요청 전달 | 쿠키 조건이 맞으면 브라우저가 자동 전송 | 보통 애플리케이션이 `Authorization: Bearer`로 추가. 쿠키에 넣으면 자동 전송 |
| 서버 확장 | 공유 세션 저장소나 요청 고정 전략 필요 | 자체 검증형 토큰은 자원 서버의 세션 조회를 줄일 수 있음 |
| 로그아웃과 강제 폐기 | 세션 저장소에서 즉시 제거 가능 | 자체 검증형 Access Token은 만료 전 폐기에 별도 상태나 정책 필요 |
| 탈취 영향 | 세션을 무효화할 때까지 세션 ID를 재사용할 수 있음 | Bearer Token 만료나 폐기 전까지 재사용할 수 있음 |
| 주요 운영 상태 | 세션 데이터, 만료, 저장소 가용성 | 서명 키, 클레임 규칙, 만료, Refresh Token 회전·폐기 |

쿠키와 토큰도 서로 반대되는 개념은 아니다. 쿠키는 브라우저가 값을 저장하고 HTTP 요청에 보내는 방법이다. 세션 ID를 쿠키에 넣을 수도 있고 Refresh Token을 쿠키에 넣을 수도 있다. 쿠키가 자동으로 전송되는 구조라면 `Secure`, `HttpOnly`, `SameSite`와 CSRF 방어를 함께 검토해야 한다.

## 장점과 한계

세션 기반 인증은 서버가 상태를 직접 관리하므로 로그아웃과 강제 만료를 바로 반영하기 쉽다. 세션에 담긴 권한이 바뀌어도 다음 조회부터 적용할 수 있다. 반면 서버가 늘어나면 세션 저장소를 공유해야 하고, 저장소의 지연이나 장애가 인증 요청에 영향을 준다.

자체 검증형 Access Token은 자원 서버가 중앙 세션 저장소를 매번 조회하지 않아도 된다. 여러 서비스가 같은 발급자의 키와 검증 규칙을 공유할 때도 활용할 수 있다. 대신 키 배포와 회전, 발급자와 대상 검증, 만료 전 폐기 정책을 일관되게 운영해야 한다.

JWT는 상태를 토큰으로 옮기는 데 편리하지만 크기와 노출 범위를 고려해야 한다. 클레임이 많아지면 요청마다 전송할 데이터도 늘어난다. 서명된 페이로드는 읽을 수 있으므로 민감한 값을 숨기는 저장소로 사용할 수도 없다.

한 방식이 언제나 더 안전하거나 확장하기 쉬운 것은 아니다. 즉시 폐기해야 하는지, 서비스와 클라이언트가 어떻게 구성되는지, 어떤 공격을 막아야 하는지를 함께 봐야 한다. 두 방식을 섞는다면 저장 위치와 검증 주체를 분명히 정해야 한다.

## 기술면접 질문

### 세션 기반 인증과 토큰 기반 인증의 가장 큰 차이는 무엇인가?

세션 기반 인증은 서버가 로그인 상태를 저장하고 클라이언트가 세션 ID를 보내는 방식입니다. 토큰 기반 인증은 클라이언트가 Access Token을 보내고 서버가 토큰의 유효성과 권한을 확인합니다. 다만 자체 검증형 토큰도 폐기 목록이나 Refresh Token 회전을 운영하면 서버 상태가 필요할 수 있습니다.

### 서명된 JWT는 암호화된 값인가?

서명된 JWT의 헤더와 페이로드는 보통 Base64url로 인코딩되므로 토큰을 가진 사람이 읽을 수 있습니다. 서명은 기밀성을 제공하지 않으며, 내용의 무결성과 신뢰한 키를 가진 주체가 만들었는지 확인하는 데 사용합니다. 내용을 숨겨야 한다면 민감한 클레임을 넣지 않거나 JWE 같은 암호화 형식을 별도로 사용해야 합니다.

### Access Token과 Refresh Token의 수명을 왜 다르게 두는가?

Access Token의 수명을 짧게 두면 탈취됐을 때 사용할 수 있는 시간을 줄일 수 있습니다. Refresh Token은 새 Access Token을 발급해 잦은 재로그인을 피하게 하지만, 탈취되면 장기간 악용될 수 있어 더 엄격하게 보호해야 합니다. 만료와 폐기, 클라이언트 바인딩, 회전이나 재사용 탐지 정책을 함께 설계해야 합니다.

## 복습 체크리스트

- [ ] HTTP 요청 사이에서 로그인 상태를 이어 줄 식별 수단이 필요한 이유를 설명할 수 있다.
- [ ] 세션 ID와 서버 측 세션 데이터의 역할을 구분할 수 있다.
- [ ] 쿠키가 세션 그 자체가 아니라 값을 전달하는 방법임을 설명할 수 있다.
- [ ] Access Token과 JWT를 같은 개념으로 단정하면 안 되는 이유를 설명할 수 있다.
- [ ] 서명된 JWT의 페이로드가 암호화되지 않았음을 설명할 수 있다.
- [ ] JWT에서 알고리즘, 발급자, 대상, 만료 조건을 검증해야 함을 설명할 수 있다.
- [ ] Access Token과 Refresh Token의 수명을 나누는 이유를 설명할 수 있다.
- [ ] Refresh Token 회전과 폐기 때문에 서버 상태가 필요할 수 있음을 설명할 수 있다.
- [ ] 세션과 토큰을 로그아웃, 확장, 탈취 대응 기준으로 비교할 수 있다.

## 참고 자료

- [로그인 #1. 세션기반인증방식 : 개념 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116072)
- [로그인 #2. 세션기반인증방식 : 실습 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116076)
- [로그인 #3. 토큰기반인증방식(access토큰, refresh토큰) 개념 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=141252)
- [로그인 #4. 토큰기반인증방식(access토큰, refresh토큰) 실습 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=141253)
- [RFC 7519: JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 8725: JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725)
- [RFC 6750: The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700)
- [RFC 10025: Cookies: HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc10025)
- [Express session middleware](https://expressjs.com/en/resources/middleware/session.html)

이전: [브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교](/study/network/browser-storage-and-cookies/) · [연재 목록](/study/network/)
