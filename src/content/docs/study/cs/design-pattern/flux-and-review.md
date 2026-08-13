---
title: Flux 패턴과 디자인 패턴 총정리
description: Flux의 단방향 상태 흐름과 MVC와의 선택 기준을 정리하고 연재의 패턴을 해결 문제 중심으로 복습합니다.
slug: study/design-patterns/flux-and-review
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, Flux, Architecture, Interview]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 8
---

여러 화면이 같은 상태를 바꾸기 시작하면 입력 하나의 파급 경로를 찾기 어려워진다. Flux가 이 흐름을 한 방향으로 제한하는 방식과 그 대가를 살펴본다.

## 핵심 요약

Flux는 상태 변경 요청이 여러 Model과 View 사이를 오가지 않고 일정한 경로를 따르게 하는 UI 애플리케이션 아키텍처 패턴이다. 핵심 순환은 **`Action → Dispatcher → Store → View → Action`**이다. 상태를 바꾸는 입구와 순서가 드러나므로 한 사용자 행동의 결과를 추적하기 쉬워진다.

단방향이 모든 처리를 동기로 만든다는 뜻은 아니다. 전통적인 Flux의 Dispatcher 콜백과 Store 갱신은 하나의 dispatch 안에서 동기적으로 완료된다고 가정하지만, 네트워크와 타이머 같은 사이드 이펙트는 바깥에서 처리한 뒤 결과를 새 Action으로 다시 보낸다. Flux는 복잡한 공유 상태에 유리한 선택지이지 MVC를 모든 규모에서 대체하는 보편적 정답은 아니다.

## MVC의 복잡성이 드러나는 지점

여러 화면이 같은 Model을 관찰하고 각 View의 사용자 이벤트가 다시 Model을 바꾸는 대규모 MVC 변형을 생각해 보자. 메시지 하나를 읽음 처리하면 목록, 안 읽은 개수 배지, 알림 패널이 함께 바뀐다. 각 화면의 갱신이 또 다른 변경을 일으키면 하나의 입력이 어디까지 전파되는지 알기 어렵다. 강의에서는 이런 Model·View 관계의 증가를 Flux가 등장한 배경으로 설명한다.

이 문제를 “MVC는 항상 양방향이라서 실패한다”로 일반화하면 안 된다. 앞 글에서 보았듯 MVC는 여러 변형이 있고 얇은 Controller와 명확한 Model 경계로도 충분히 잘 작동한다. Flux가 겨냥하는 지점은 패턴 이름이 아니라 **상태 변경 경로가 여러 방향으로 늘어나 갱신 순서와 원인을 예측하기 어려워진 상태**다.

## Flux의 네 가지 구성 요소

| 구성 요소 | 책임 | 경계를 지키는 질문 |
| --- | --- | --- |
| Action | 사용자 의도나 서버 결과를 type과 payload로 표현 | 어떤 일이 일어났는지를 상태 변경 코드 없이 설명하는가? |
| Dispatcher | Action을 등록된 Store 콜백에 전달하고 필요한 갱신 순서를 조정 | 모든 상태 변경 요청이 공통 입구를 거치는가? |
| Store | 특정 도메인의 상태와 Action을 해석하는 갱신 로직을 소유 | 외부가 Store의 상태를 직접 수정하지 않는가? |
| View | Store에서 읽은 상태를 표현하고 사용자 상호작용을 다음 Action으로 변환 | 화면이 상태 원본을 별도로 변경하고 있지 않은가? |

강의는 Action, Dispatcher, Store, View의 네 역할과 Action type에 따른 처리를 핵심으로 다룬다. 전통적인 Facebook Flux의 Dispatcher는 복잡한 분기 로직을 소유하는 Controller가 아니다. 등록된 Store 콜백 전체에 Action을 전달하는 중심 허브에 가깝다. 각 Store가 type을 보고 자신에게 관련된 Action인지 판단한다. Flux의 영향을 받은 Redux는 별도 Dispatcher 없이 `dispatch`와 reducer로 상태 갱신을 구성한다.

## 단방향 데이터 흐름

`Action → Dispatcher → Store → View → Action`

1. 사용자가 View에서 “메시지 읽음”을 누르면 View는 `MARK_MESSAGE_READ` Action을 만든다.
2. Dispatcher는 Action을 등록된 Store 콜백에 전달한다. 여러 Store 사이에 순서 의존이 있다면 `waitFor` 같은 조정 규칙을 명시한다.
3. Store는 Action을 해석해 메시지 상태와 안 읽은 개수를 갱신하고 변경을 알린다. View나 외부 코드는 Store의 setter를 직접 호출하지 않는다.
4. View는 갱신된 Store 상태를 다시 읽어 목록과 배지를 렌더링한다.
5. 렌더링 자체가 즉시 새 Action을 만드는 것은 아니며, 이후의 사용자 상호작용이나 서버 응답이 다음 Action을 발생시켜 순환을 이어 간다.

전통적인 Flux에서 `dispatch(action)`과 그에 대응하는 Store 콜백·상태 변경은 **한 번의 dispatch 라운드 안에서 동기적으로** 완료된다고 가정한다. 그래야 순서 의존이 있는 Store도 먼저 갱신된 Store를 확인한 뒤 같은 라운드에서 결과를 계산할 수 있다.

이 구간에 `await` 대상인 API 호출을 섞으면 Action 순서와 실패 정책이 흐려진다. 네트워크·타이머·저장소 I/O는 Action creator, effect 계층, middleware 같은 바깥 경계에서 처리한다. 이후 `REQUESTED`, `SUCCEEDED`, `FAILED`처럼 결과를 다시 Action으로 표현한다. 구체적인 비동기 API는 Flux 계열 라이브러리마다 다르므로 해당 구현의 계약을 확인해야 한다.

### 새 요구 사항이 들어오면 어디가 바뀌는가

“메시지를 바로 읽음 표시하되, 서버 저장이 실패하면 안 읽음으로 되돌리고 오류를 보여 준다”는 요구를 추가해 보자.

| 구조 | 즉시 표시와 실패 롤백을 추가할 때의 변경 영향 |
| --- | --- |
| Flux 없음 | 메시지 행 View가 자신의 읽음 표시를 바꾸고, 안 읽은 개수 View를 별도로 갱신하고, API 콜백이 실패하면 두 View와 Model을 역순으로 되돌리는 코드를 함께 수정한다. 각 곳의 성공·실패 테스트가 갱신 순서와 중복 상태에 의존할 수 있다. |
| Flux 적용 후 | `MARK_READ_REQUESTED`에서 Store가 즉시 읽음 상태와 파생된 개수를 한 경계에서 갱신하고, effect 계층이 API를 호출한 뒤 `MARK_READ_SUCCEEDED` 또는 `MARK_READ_FAILED`를 dispatch한다. 새 요구의 핵심 변경은 Action 계약, Store의 낙관적 갱신·롤백, effect의 API 호출과 각 단위 테스트에 머물고 View는 갱신된 상태를 렌더링한다. |

실패 이유나 재시도 버튼처럼 화면에 새로운 표현이 필요하면 View도 수정된다. Action·Store·effect·View 경계는 변경 원인이 놓이는 위치를 보여 준다.

## MVC와 Flux 비교

| 비교 기준 | MVC | Flux |
| --- | --- | --- |
| 데이터 흐름 | Controller가 Model과 View를 조정하지만, 변형에 따라 View의 Model 조회·관찰과 여러 갱신 경로가 공존 | Action에서 Dispatcher, Store, View로 진행하고 다음 이벤트가 새 Action을 만드는 단방향 순환 |
| 상태 변경 위치 | Model이 담당하는 것이 원칙이지만 Controller·View와의 세부 경계는 MVC 변형과 프레임워크에 따라 다름 | Store의 Dispatcher 콜백이 Action을 해석해 상태를 갱신하고 외부에는 읽기 경계를 제공 |
| 추적 용이성 | 작은 화면은 간단하지만 Model·View 연결과 연쇄 갱신이 늘면 원인 경로를 별도로 파악해야 함 | Action 기록과 Store 상태 전이를 순서대로 따라갈 수 있지만 비동기 effect가 경계 밖에 드러나야 이점을 유지 |
| 초기 복잡도 | 화면과 요청이 작을 때 역할이 직관적이고 적은 구성으로 시작 가능 | Action, Dispatcher, Store, 구독, effect 경계가 필요해 작은 기능에는 간접 호출과 보일러플레이트가 더 큰 비용 |

MVC는 표현·입력·도메인 책임을 나누는 데 초점이 있고, Flux는 공유 상태의 변경 경로를 통제한다. 서버 참조 위주의 간단한 CRUD 화면은 MVC만으로 충분할 수 있다. 여러 View가 공유 상태를 동시에 표현하고 낙관적 갱신·롤백·서버 이벤트를 함께 처리한다면 Flux 계열 구조의 비용을 감수할 근거가 생긴다. 외부 HTTP 요청은 MVC Controller로 받고 복잡한 클라이언트 상태는 Flux 계열로 관리하는 식으로 두 선택을 다른 경계에서 함께 쓸 수도 있다.

## 패턴별 해결 문제 총정리

패턴을 외우기보다 “무엇이 바뀌어서 현재 코드가 함께 흔들리는가”를 먼저 묻는다. DI는 필요한 협력자를 외부에서 제공하는 방법이고 DIP는 상위 정책과 하위 세부 구현이 추상화에 의존하게 하는 원칙이므로, 아래 패턴 표의 전략 같은 교체 경계를 구성할 때 함께 살펴본다.

| 패턴 | 해결 문제 | 핵심 아이디어 | 주의점 |
| --- | --- | --- | --- |
| 싱글톤 | 공유해도 되는 객체의 중복 생성과 수명 관리 | 생성을 통제하고 하나의 접근점으로 인스턴스 공유 | 전역 의존성, 공유 상태의 동시성, 테스트 격리 비용 |
| 팩토리 | 구체 타입 선택과 생성 절차가 호출부로 전파되는 문제 | 생성 결정을 팩토리에 모으고 호출부는 추상화 사용 | 단순 팩토리의 분기가 계속 늘면 변경 집중점이 됨 |
| 이터레이터 | 순회 코드가 컬렉션의 저장 구조에 결합되는 문제 | `Iterator` 규약으로 요소 접근 순서와 위치 이동 은닉 | 순회 중 변경, 순서, 지연 조회 계약은 별도 정의 |
| 전략 | 같은 목적의 알고리즘·정책 분기가 컨텍스트에 섞이는 문제 | 교체 가능한 행동을 공통 계약 뒤에 캡슐화 | 전략 수와 선택 규칙이 늘면 조합 복잡도가 커짐 |
| 옵저버 | 상태 변경 후속 처리가 발행자에 직접 결합되는 문제 | Subject가 Observer 계약을 통해 등록된 구독자에게 통지 | 구독 해제, 통지 순서, 실패 격리와 즉시 일관성 |
| 프록시 | 권한·로깅·지연 생성 같은 접근 정책이 대상과 호출부에 퍼지는 문제 | 대상과 같은 계약의 대리자가 정책 적용 후 실제 대상에 위임 | 프록시 우회, 지연 추가, 대상과의 계약 일치 |
| MVC 계열 | 도메인 상태·화면 표현·입력 조정이 한 곳에 섞이는 문제 | MVC·MVP·MVVM의 중간 역할과 View 관계로 변경 이유 분리 | Controller·Presenter 비대화, 바인딩·갱신 경로, 플랫폼별 차이 |
| Flux | 공유 상태의 변경 경로와 연쇄 갱신이 여러 방향으로 얽히는 문제 | Action으로 변경을 표현하고 Dispatcher·Store·View 순서로 흐르게 함 | 보일러플레이트, Store 비대화, 비동기 effect·오류 정책 설계 |

## 장점과 한계

Flux에서는 변경 입구와 순서가 Action 흐름으로 드러난다. 같은 Action과 이전 상태로 Store 상태 전이를 재현해 검증할 수 있다. 버그가 나면 View의 setter를 뒤지는 대신 Action 기록부터 역추적한다. 여러 View가 공유하는 상태를 Store의 하나의 원본에서 파생하면 화면별 값이 서로 엇갈릴 가능성도 줄어든다.

한계는 구성 요소와 간접 호출이 늘어난다는 점이다. 작은 폼 하나에 Action 상수, Dispatcher, Store, 구독 코드까지 두면 직접 상태 관리보다 읽기 어렵고, 모든 상태를 하나의 Store에 모으면 또 다른 거대 의존성이 생긴다. 또한 Action 이름과 payload 계약, 비동기 취소·재시도·중복 응답 처리를 분명히 정하지 않으면 단방향 화살표만 남고 실제 상태는 여전히 예측하기 어렵다.

## 기술면접 질문

### Flux가 등장한 이유는 무엇인가

Flux는 복잡한 UI에서 Model과 View 사이의 연쇄 갱신을 예측하기 어려워진 문제를 줄이기 위해 등장했습니다. 모든 상태 변경 요청을 Action으로 표현하고 Dispatcher와 Store를 거쳐 View에 반영하면 변경 입구와 순서를 일정하게 추적할 수 있습니다. 예를 들어 메시지 읽음 상태와 안 읽은 개수를 한 Action 흐름에서 갱신할 수 있지만, 작은 화면에는 구조 비용이 더 클 수 있습니다.

### 단방향 흐름의 장점과 단점은 무엇인가

단방향 흐름은 상태 전이를 재현·추적하기 쉽게 하지만 간접 계층과 보일러플레이트를 늘립니다. View가 상태를 직접 바꾸지 않고 Action, Dispatcher, Store를 거치므로 같은 입력의 처리 경로와 결과를 검증할 수 있습니다. 다만 네트워크 작업을 Store 갱신 중에 섞거나 작은 폼까지 모두 Flux로 구성하면 오히려 원인 추적과 유지 보수가 어려워집니다.

### MVC와 Flux는 어떤 기준으로 선택하는가

MVC와 Flux는 우열로 고르지 말고 역할 분리와 공유 상태 흐름 중 어느 문제가 더 큰지로 선택합니다. 화면과 요청이 단순하면 MVC의 Model·View·Controller 경계가 적은 비용으로 충분하고, 여러 View의 공유 상태와 연쇄 갱신이 많으면 Flux의 변경 경로 제약이 유리합니다. 예를 들어 서버는 Spring MVC로 요청을 처리하고 클라이언트는 Flux 계열로 상태를 관리할 수 있으므로 하나가 다른 하나를 보편적으로 대체하지는 않습니다.

### 요구 사항에 맞는 패턴은 어떻게 선택하는가

요구 사항에 맞는 패턴은 패턴 이름보다 반복되거나 구체적으로 예상되는 변경 축을 먼저 찾아 선택합니다. 새 요구에서 함께 바뀌는 코드와 패턴 적용 후 유지할 계약을 비교하고, 줄어드는 변경 비용이 추상화 비용보다 큰지 판단합니다. 예를 들어 결제 알고리즘이 계속 늘면 전략을, 후속 알림이 늘면 옵저버를 검토하지만 변화 근거가 없는 한 번의 분기는 그대로 두는 편이 낫습니다.

## 복습 체크리스트

- [ ] `Action → Dispatcher → Store → View → Action` 순환을 각 구성 요소의 책임과 함께 설명할 수 있다.
- [ ] 한 dispatch 안의 동기 Store 갱신과 네트워크 같은 비동기 사이드 이펙트 경계를 구분할 수 있다.
- [ ] 같은 메시지 읽음·롤백 요구에서 Flux 적용 전·후의 수정 위치를 비교할 수 있다.
- [ ] MVC와 Flux를 대체 관계로 단정하지 않고 역할 분리·상태 복잡도로 선택할 수 있다.
- [ ] 연재의 각 패턴을 해결 문제, 핵심 아이디어, 주의점으로 요약할 수 있다.

## 참고 자료

- [flux패턴 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=118705)
- [Facebook Flux — In-Depth Overview](https://facebookarchive.github.io/flux/docs/in-depth-overview/)
- [Facebook Flux — Dispatcher](https://facebookarchive.github.io/flux/docs/dispatcher/)
- [Redux — Prior Art](https://redux.js.org/understanding/history-and-design/prior-art)

---

이전: [MVC·MVP·MVVM과 Spring MVC](/study/design-patterns/mvc-mvp-mvvm/) · [연재 목록](/study/design-patterns/)
