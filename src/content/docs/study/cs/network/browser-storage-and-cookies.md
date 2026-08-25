---
title: "브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교"
description: 로컬스토리지와 세션스토리지, 쿠키의 저장 범위와 수명, 서버 전송 방식을 비교하고 HTTP 캐시와의 차이를 정리합니다.
slug: study/network/browser-storage-and-cookies
contentType: study
publishedAt: 2026-08-25
tags: [Network, WebStorage, Cookie, Browser]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 13
---

로컬스토리지, 세션스토리지, 쿠키는 이름이 익숙해도 차이가 쉽게 섞였다. 이번에는 데이터가 살아 있는 시간과 공유 범위, 서버로 전송되는 방식을 기준으로 다시 정리했다.

## 핵심 요약

- 로컬스토리지와 세션스토리지는 문자열 키와 값을 다루는 Web Storage API다. 브라우저가 HTTP 요청에 자동으로 넣지 않는다.
- 로컬스토리지는 오리진별로 공유되며 브라우저 세션이 끝나도 남을 수 있다. 세션스토리지는 오리진과 탭의 세션을 함께 기준으로 나뉜다.
- 쿠키는 적용 가능한 도메인과 경로, 보안 조건을 만족하는 HTTP 요청에 자동으로 포함된다.
- `Secure`, `HttpOnly`, `SameSite`는 각각 전송 채널, 스크립트 접근, 사이트 간 요청에서 쿠키가 쓰이는 범위를 제한한다.
- HTTP 캐시는 이전 HTTP 응답을 재사용하는 장치다. Web Storage나 쿠키에 애플리케이션 상태를 보관하는 일과 목적이 다르다.

## 브라우저에 저장된다고 모두 HTTP 캐시는 아니다

HTTP 캐시는 재사용 가능한 응답 메시지를 저장한다. 같은 요청을 다시 처리할 때 저장된 응답을 재사용해 지연과 네트워크 전송량을 줄인다. `Cache-Control`, `Expires`, 검증 조건 같은 HTTP 규칙이 저장과 재사용 여부를 결정한다.

로컬스토리지와 세션스토리지는 애플리케이션이 직접 읽고 쓰는 문자열 저장소다. 값을 저장해도 브라우저가 그 값으로 HTTP 응답을 대신하지 않는다. API 응답을 로컬스토리지에 넣어 다시 쓸 수는 있지만, 만료와 갱신은 애플리케이션이 구현해야 한다.

쿠키도 HTTP 캐시는 아니다. 쿠키는 서버가 클라이언트의 상태를 이어 가도록 이름과 값을 저장하는 수단이다. 브라우저는 조건에 맞는 후속 요청의 `Cookie` 필드에 값을 넣는다. 이전 응답 본문을 재사용하는 동작과는 다르다.

**HTTP 캐시는 응답을 재사용한다. Web Storage와 쿠키는 애플리케이션 상태를 보관한다.**

## 로컬스토리지는 오리진별로 오래 남는 문자열 저장소다

`localStorage` 데이터는 현재 창의 오리진에 묶인다. 오리진은 스킴, 호스트, 포트로 구성된다. 셋 중 하나라도 다르면 같은 키를 사용해도 별도의 저장 영역을 보게 된다.

같은 오리진의 창과 탭은 로컬스토리지 값을 공유할 수 있다. 브라우저 세션을 닫아도 값이 남을 수 있어 테마, 최근 검색어처럼 다음 방문에도 필요한 클라이언트 상태에 어울린다. 다만 사용자가 데이터를 지우거나 브라우저가 저장 정책에 따라 제거할 수 있으므로 영구 보관소로 보면 안 된다.

Web Storage는 키와 값을 문자열로 저장한다. 배열이나 객체는 직렬화한 뒤 넣어야 한다.

```js
const recentSearches = ["Java", "Spring"];

localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

const savedSearches = JSON.parse(
  localStorage.getItem("recentSearches") ?? "[]"
);

localStorage.removeItem("recentSearches");
```

`setItem()`은 저장 공간이 부족하거나 사용자가 저장을 막은 상황에서 실패할 수 있다. Web Storage API는 동기 방식이므로 큰 데이터를 자주 읽고 쓰는 용도에도 맞지 않는다.

**다음 브라우저 세션에도 남아야 하는 비민감 UI 상태라면 로컬스토리지를 먼저 검토할 수 있다.**

## 세션스토리지는 탭의 작업 흐름을 분리한다

`sessionStorage`도 같은 `Storage` 인터페이스를 사용한다. 차이는 데이터의 범위다. 세션스토리지는 오리진뿐 아니라 최상위 브라우징 컨텍스트의 세션을 함께 기준으로 저장 영역을 나눈다. 보통 같은 사이트를 서로 다른 탭에서 열면 각 탭이 별도의 값을 가진다.

한 탭 안에서 새로고침하거나 같은 오리진의 다른 페이지로 이동해도 세션은 이어진다. 탭이나 창을 닫아 세션이 끝나면 데이터도 제거된다. 여러 탭에서 진행 중인 입력이나 단계가 섞이면 안 되는 경우에 이 성질이 유용하다.

```js
const checkoutDraft = {
  productId: 42,
  quantity: 2,
};

sessionStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));

const savedDraft = JSON.parse(
  sessionStorage.getItem("checkoutDraft") ?? "null"
);
```

새 창을 `window.open()`으로 만들면 기존 세션스토리지의 초기 상태가 복사될 수 있다. 복사 뒤에는 서로 독립적으로 바뀐다. 따라서 "모든 새 탭은 언제나 빈 저장소로 시작한다"고 외우기보다 오리진과 최상위 브라우징 컨텍스트를 함께 보는 편이 정확하다.

**탭마다 독립적인 임시 작업 상태가 필요하다면 세션스토리지가 로컬스토리지보다 경계를 잘 드러낸다.**

## 쿠키는 요청에 실려 서버로 돌아가는 상태다

서버는 응답의 `Set-Cookie` 필드로 쿠키를 저장하게 할 수 있다. 브라우저는 만료되지 않았고 도메인과 경로 등 조건이 맞는 쿠키를 후속 요청의 `Cookie` 필드에 담는다.

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=a8f3d1; Max-Age=1800; Path=/; Secure; HttpOnly; SameSite=Lax
```

```http
GET /me HTTP/1.1
Host: example.com
Cookie: sessionId=a8f3d1
```

`Max-Age`는 쿠키가 유지될 최대 시간을 초 단위로 정한다. `Expires`와 함께 있으면 `Max-Age`가 우선한다. 둘 다 없다면 브라우저가 정의한 현재 세션이 끝날 때 삭제하는 세션 쿠키가 된다.

세 보안 속성은 제한하는 대상이 다르다.

- `Secure`는 일반적으로 HTTPS 같은 안전한 채널을 사용하는 요청에만 쿠키를 포함하게 한다.
- `HttpOnly`는 `document.cookie` 같은 비HTTP API에서 쿠키를 숨긴다. 스크립트가 읽지 못하게 할 세션 식별자에 사용한다.
- `SameSite`는 동일 사이트와 교차 사이트 요청에서 쿠키를 포함할 범위를 `Strict`, `Lax`, `None`으로 조정한다.

쿠키는 클라이언트 스크립트에서도 설정할 수 있지만, 그렇게 만든 쿠키에는 `HttpOnly`를 붙일 수 없다. 인증 세션처럼 스크립트 접근을 막아야 하는 값은 서버가 `Set-Cookie`로 설정하는 편이 맞다.

RFC 10025의 처리 알고리즘은 쿠키 이름과 값의 합이 4096 octet을 넘으면 해당 쿠키를 무시하도록 정한다. 쿠키는 조건에 맞는 요청마다 전송되므로 큰 데이터를 보관할수록 요청 비용도 늘어난다.

**서버가 요청마다 확인해야 하는 작은 상태에는 쿠키가 맞다. 요청과 무관한 클라이언트 데이터를 담으면 매번 전송 비용만 늘어난다.**

## 세 저장소의 선택 기준

저장 위치가 모두 브라우저라는 공통점보다 수명과 전송 방식을 먼저 비교하면 선택하기 쉽다.

| 비교 기준 | 로컬스토리지 | 세션스토리지 | 쿠키 |
| --- | --- | --- | --- |
| 주요 범위 | 오리진 | 오리진 + 최상위 브라우징 컨텍스트 | 호스트·도메인, 경로, SameSite 등 쿠키 규칙 |
| 수명 | 브라우저 세션 뒤에도 남을 수 있음 | 탭이나 창의 세션이 끝날 때까지 | 세션 또는 `Max-Age`·`Expires`로 지정한 시점까지 |
| 서버 자동 전송 | 하지 않음 | 하지 않음 | 조건에 맞는 HTTP 요청에 포함 |
| 스크립트 접근 | 가능 | 가능 | `document.cookie`로 가능, `HttpOnly`는 제외 |
| 표준상 크기 기준 | 권장 quota 5 MiB | 권장 quota 5 MiB | 이름과 값의 합 최대 4096 octet |
| 어울리는 예 | 테마, 최근 검색어 | 탭별 입력 초안, 단계 진행 상태 | 세션 식별자, 서버가 읽어야 하는 설정 |

Web Storage의 5 MiB는 WHATWG Storage Standard에 등록된 권장 quota다. 실제 저장 가능량과 제거 정책은 브라우저 구현과 사용자 설정에 따라 달라질 수 있다.

민감한 값인지도 따져야 한다. 로컬스토리지와 세션스토리지는 같은 오리진에서 실행되는 스크립트가 읽을 수 있다. 스크립트 접근을 차단해야 하는 세션 식별자는 `HttpOnly` 쿠키가 더 적합하다. 반대로 쿠키는 자동 전송되므로 `SameSite`와 CSRF 방어를 함께 설계해야 한다.

## 장점과 한계

로컬스토리지는 브라우저 세션을 넘어 유지할 클라이언트 상태를 간단히 저장한다. 세션스토리지는 탭마다 진행 중인 작업을 분리한다. 둘 다 HTTP 요청에 자동으로 붙지 않아 쿠키처럼 매 요청의 크기를 늘리지 않는다.

Web Storage는 편리하지만 신뢰할 수 있는 영구 데이터베이스가 아니다. 사용자가 지울 수 있고 브라우저 정책에 따라 접근이나 저장이 거부될 수 있다. 문자열만 다루며 API가 동기 방식이라는 제약도 있다. 서버 데이터의 복사본을 저장한다면 만료 시점과 갱신 실패를 애플리케이션이 직접 처리해야 한다.

쿠키는 HTTP 요청과 연결되므로 서버 세션을 이어 가기 좋다. 대신 적용 범위가 넓거나 크기가 커지면 불필요한 요청에도 값이 실릴 수 있다. `Secure`, `HttpOnly`, `SameSite`도 각각 한 종류의 위험을 줄일 뿐 모든 공격을 막아 주지는 않는다.

세 수단 모두 브라우저 정책과 사용자 제어를 받는다. 저장했다는 사실만으로 데이터의 장기 보존을 보장할 수 없다. 중요한 원본 데이터는 서버나 목적에 맞는 영속 저장소에서 관리해야 한다.

## 기술면접 질문

### Web Storage와 HTTP 캐시는 어떻게 다른가?

Web Storage는 애플리케이션이 문자열 키와 값을 직접 읽고 쓰는 클라이언트 저장소입니다. HTTP 캐시는 캐시 가능한 응답 메시지를 저장하고 HTTP 규칙에 따라 이후 요청에 재사용합니다. 로컬스토리지에 API 응답을 넣어 재사용하더라도 브라우저의 HTTP 캐시가 되는 것은 아니며 만료와 갱신을 애플리케이션이 관리해야 합니다.

### 로컬스토리지와 세션스토리지의 차이는 무엇인가?

둘 다 오리진별 `Storage` 객체와 같은 API를 사용하지만 수명과 공유 범위가 다릅니다. 로컬스토리지는 같은 오리진의 창과 탭에서 공유되며 브라우저 세션 뒤에도 남을 수 있습니다. 세션스토리지는 오리진과 최상위 브라우징 컨텍스트별로 분리되고 해당 탭이나 창의 세션이 끝나면 제거됩니다.

### 쿠키의 Secure, HttpOnly, SameSite는 각각 무엇을 제한하는가?

`Secure`는 쿠키를 안전한 채널의 요청에만 포함하도록 전송 범위를 제한합니다. `HttpOnly`는 스크립트 같은 비HTTP API의 접근을 막습니다. `SameSite`는 동일 사이트와 교차 사이트 요청에서 쿠키를 포함할 조건을 조정하므로 세 속성을 필요한 보호에 맞춰 함께 설정해야 합니다.

## 복습 체크리스트

- [ ] Web Storage와 HTTP 캐시가 저장하고 재사용하는 대상을 구분할 수 있다.
- [ ] 오리진을 구성하는 스킴, 호스트, 포트를 설명할 수 있다.
- [ ] 로컬스토리지의 공유 범위와 보존 한계를 설명할 수 있다.
- [ ] 세션스토리지가 탭의 작업 흐름을 분리하는 이유를 설명할 수 있다.
- [ ] `Set-Cookie`와 `Cookie` 필드가 오가는 방향을 구분할 수 있다.
- [ ] `Secure`, `HttpOnly`, `SameSite`의 역할을 각각 설명할 수 있다.
- [ ] 서버 자동 전송 여부와 스크립트 접근 여부를 기준으로 저장 수단을 선택할 수 있다.
- [ ] 저장 공간과 보존 기간이 브라우저 정책의 영향을 받음을 설명할 수 있다.

## 참고 자료

- [웹브라우저의 캐시 #1. 로컬스토리지의 개념과 실습 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=120258)
- [웹브라우저의 캐시 #2. 로컬스토리지와 오리진(origin) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=140056)
- [웹브라우저의 캐시 #3. 로컬스토리지의 활용사례 : 캐싱 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=120257)
- [웹브라우저의 캐시 #4. 세션스토리지 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116075)
- [웹브라우저의 캐시 #5. 쿠키(Cookie) ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=140423)
- [웹브라우저의 캐시 #6. 로컬스토리지, 세션스토리지, 쿠키의 공통점과 차이점 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=140839)
- [WHATWG HTML Standard: Web storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Storage Standard](https://storage.spec.whatwg.org/)
- [RFC 10025: Cookies: HTTP State Management Mechanism](https://www.rfc-editor.org/info/rfc10025)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)

이전: [HTTPS는 어떻게 안전한 연결을 만드는가: TLS 1.3 핸드셰이크](/study/network/https-tls-1-3-handshake/) · [연재 목록](/study/network/) · 다음: [로그인 상태는 어디에 저장되는가: 세션 인증과 토큰 인증 비교](/study/network/session-vs-token-authentication/)
