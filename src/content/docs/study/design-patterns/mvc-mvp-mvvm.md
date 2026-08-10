---
title: MVC·MVP·MVVM과 Spring MVC
description: MVC·MVP·MVVM의 책임과 결합 방식을 비교하고 DispatcherServlet의 뷰 렌더링·REST 응답 흐름을 구분합니다.
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, MVC, MVVM, Spring MVC]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 7
---

## 핵심 요약

MVC, MVP, MVVM은 데이터와 비즈니스 규칙을 화면 표현과 분리하고 사용자 입력을 중간 역할이 조정하게 하는 UI 아키텍처 패턴이다. MVC의 Controller는 입력을 해석해 Model 작업과 다음 표현을 조정하고, MVP의 Presenter는 View 계약을 직접 갱신하며, MVVM의 ViewModel은 View가 바인딩할 상태와 Command를 노출한다. 이름만 바꾼 같은 구현이 아니라 플랫폼의 이벤트 모델과 바인딩 기능에 따라 의존 방향과 테스트 경계가 달라지는 선택지다.

## 표현 로직을 분리해야 하는 이유

한 화면 객체가 입력 읽기, 유효성 검증, 데이터 저장, 결과 문구 변경까지 모두 맡으면 UI 변경과 정책 변경이 같은 메서드를 흔든다. 웹 화면과 데스크톱 화면이 같은 회원 이름 변경 규칙을 제공하더라도 각 클릭 핸들러가 공백 제거와 빈 값 검사를 복제하면 규칙 수정도 여러 곳에 퍼진다. 표현 계층을 나누는 목적은 파일 수를 늘리는 것이 아니라 **변화의 이유마다 수정 경계를 세우는 것**이다.

새 요구 사항이 “이름 앞뒤 공백을 제거하고 빈 이름은 저장하지 않으며 오류를 표시한다”라고 해 보자.

| 구조 | 현재 구현 | 새 요구가 들어왔을 때 바뀌는 코드 |
| --- | --- | --- |
| 분리 전 | `ProfileScreen.onSave()`가 위젯 읽기, 검증, 저장, 문구 변경을 한 번에 수행 | 각 화면의 이벤트 핸들러와 저장·표시를 함께 검증하는 테스트를 수정 |
| MVC 적용 후 | Model이 이름 규칙을 처리하고 Controller가 결과를 조정하며 View가 표시 | `ProfileModel.rename()`의 규칙과 단위 테스트를 수정하고, 기존 성공·실패 표현 계약이 유지되면 Controller와 View는 유지 |

오류 종류별 문구나 새 입력 상태까지 View 계약에 추가해야 한다면 Controller와 View도 바뀐다. MVC는 모든 변경을 한 파일에 가두는 장치가 아니라, 도메인 규칙과 표현 요구 중 무엇이 변했는지에 따라 영향 범위를 예측하게 한다.

## MVC의 책임과 흐름

- **Model**: 화면과 독립적인 상태, 데이터 접근 결과, 비즈니스 규칙을 표현한다. Model을 단순 DTO나 데이터베이스 그 자체로만 한정하지 않는다.
- **View**: Model의 결과를 사용자가 볼 수 있는 화면으로 표현하고 입력 이벤트를 전달한다. 핵심 비즈니스 규칙을 View 위젯 코드에 두지 않는다.
- **Controller**: 요청이나 UI 이벤트를 해석하고 적절한 Model 작업을 호출한 뒤 어떤 결과를 표현할지 조정한다. 모든 비즈니스 로직을 Controller에 모으는 역할은 아니다.

개념 흐름은 `사용자 입력 → Controller → Model 변경·조회 → View 표현`으로 정리할 수 있다. 다만 어떤 MVC는 View가 Model을 직접 조회하거나 변경 알림을 구독하고, 어떤 MVC는 Controller가 View에 Model을 전달하므로 모든 프레임워크의 참조 방향이 동일하지 않다.

다음 Java 예시는 View가 입력·표현 계약만 제공하고 Controller가 Model 작업을 조정하는 최소 구조다.

```java
record Profile(String name) {}

final class ProfileModel {
    Profile rename(String rawName) {
        String name = rawName.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        return new Profile(name);
    }
}

interface ProfileView {
    String enteredName();
    void showProfile(Profile profile);
    void showError(String message);
}

final class ProfileController {
    private final ProfileModel model;
    private final ProfileView view;

    ProfileController(ProfileModel model, ProfileView view) {
        this.model = model;
        this.view = view;
    }

    void save() {
        try {
            view.showProfile(model.rename(view.enteredName()));
        } catch (IllegalArgumentException exception) {
            view.showError(exception.getMessage());
        }
    }
}
```

이 예시는 책임을 보이기 위해 저장소와 UI 프레임워크를 생략했다. 실제 애플리케이션에서는 Controller가 직접 데이터 접근을 구현하기보다 Model 또는 애플리케이션 서비스를 호출하고, View 구현은 웹 템플릿·모바일 화면·데스크톱 위젯의 생명주기에 맞춘다.

## MVP와 MVVM은 무엇이 다른가

MVP의 Presenter는 보통 View가 제공하는 인터페이스에 의존한다. View는 클릭 같은 이벤트를 Presenter에 전달하고, Presenter는 Model을 호출한 뒤 `showProfile`이나 `showError` 같은 View 메서드로 표시 상태를 명령한다. 이른바 Passive View로 구성하면 Presenter를 실제 UI 없이 가짜 View로 단위 테스트하기 쉽지만, 화면마다 View 계약과 연결 코드가 늘고 Presenter가 화면 세부사항을 많이 알면 강한 결합이 생긴다. View와 Presenter를 일대일로 두는 구현이 흔해도 모든 MVP의 불변 규칙은 아니다.

MVVM의 ViewModel은 특정 View 메서드를 직접 호출하기보다 View가 관찰하거나 바인딩할 상태와 사용자 행동을 나타내는 Command를 노출한다. View는 바인딩 엔진이나 명시적인 구독 코드를 통해 ViewModel의 상태를 화면과 동기화한다. ViewModel은 구체 View를 몰라도 테스트할 수 있지만, 비동기 갱신 순서·양방향 바인딩·구독 해제가 복잡해지면 상태 변화의 원인을 추적하기 어렵고 실제 바인딩은 UI 통합 테스트가 필요하다.

따라서 MVP를 “Controller의 이름만 Presenter로 바꾼 MVC”, MVVM을 “Presenter의 이름만 ViewModel로 바꾼 MVP”로 구현하면 차이를 놓친다. 판단 기준은 중간 객체가 구체 View 계약을 호출하는지, View가 노출된 상태에 바인딩하는지, 상태 동기화를 누가 책임지는지다. Android, WPF, 웹 프레임워크처럼 플랫폼별 수명 주기와 바인딩 기능이 다르므로 같은 패턴 이름도 세부 구현은 달라질 수 있다.

## MVC·MVP·MVVM 비교

| 패턴 | 중간 역할 | View와의 관계 | 상태 동기화 | 대표적인 부담 |
| --- | --- | --- | --- | --- |
| MVC | Controller가 입력을 해석하고 Model 작업과 표현을 조정 | View가 Model을 조회·관찰하거나 Controller가 결과를 전달하는 등 변형이 있음 | Controller 조정 또는 Model 변경 알림 등 구현에 따라 다름 | 규모가 커지면 Model·View·Controller 사이 갱신 경로가 얽히고 Controller가 비대해질 수 있음 |
| MVP | Presenter가 Model 결과를 View 인터페이스의 메서드로 전달 | Presenter와 View 계약이 직접 연결되며 화면별 일대일 구성이 흔함 | Presenter가 View에 표시 명령을 명시적으로 호출 | View 인터페이스와 연결 코드가 늘고 Presenter가 화면 세부사항에 결합될 수 있음 |
| MVVM | ViewModel이 화면용 상태와 Command를 제공 | View가 ViewModel을 참조해 상태에 바인딩하고 ViewModel은 구체 View를 모르는 방향을 지향 | 바인딩·관찰 메커니즘이 상태 변화를 전달 | 숨은 바인딩 흐름, 중복 상태, 비동기 갱신 순서와 구독 생명주기 관리가 필요 |

테스트하기 쉬운 정도도 패턴 이름만으로 결정되지 않는다. Presenter와 ViewModel은 UI 프레임워크에서 분리하면 빠른 단위 테스트가 가능하지만, 정적 전역 상태나 플랫폼 타입을 내부에 직접 참조하면 다시 격리가 어려워진다. MVC Controller도 얇은 입력 어댑터로 두면 단위 테스트하기 쉽고, URL 매핑·직렬화·템플릿 연결은 프레임워크 통합 테스트로 확인해야 한다.

## Spring MVC 요청 처리 흐름

Spring Web MVC는 Servlet 기반 웹 프레임워크이며 `DispatcherServlet`을 프론트 컨트롤러로 둔다. 개념적인 주 흐름은 `요청 → DispatcherServlet → HandlerMapping → Controller → ModelAndView 또는 응답 본문`이다. 실제로는 `HandlerMapping`이 찾은 핸들러를 실행하기 위해 `HandlerAdapter`가 사이에 참여하므로 더 정확한 순서는 다음과 같다.

1. Servlet 컨테이너가 매핑된 HTTP 요청을 `DispatcherServlet`에 전달한다.
2. `DispatcherServlet`은 `HandlerMapping`에 요청을 처리할 핸들러와 인터셉터 체인을 조회한다. `HandlerMapping`은 대상을 찾는 책임이며 Controller 메서드를 직접 실행하지 않는다.
3. `DispatcherServlet`은 대상 형식을 이해하는 `HandlerAdapter`에 실행을 위임하고, 이 어댑터가 요청 인자를 준비해 Controller 메서드를 호출한다.
4. Controller는 입력을 애플리케이션 작업으로 변환하고 처리 결과를 반환한다. 핵심 비즈니스 규칙은 보통 별도 서비스나 Model에 위임해 웹 요청 조정 책임과 구분한다.
5. 반환값의 의미에 따라 서버 렌더링 View 경로 또는 응답 본문 경로로 갈라진다.
6. 처리 중 예외가 발생하면 등록된 `HandlerExceptionResolver`가 예외를 응답, 오류 View 또는 다른 처리 결과로 변환할 수 있다.

### 서버 렌더링 View 경로

`@Controller` 메서드가 논리적 View 이름, `ModelAndView`, `Model` 같은 렌더링 결과를 반환하면 Model 데이터와 View 선택 정보가 준비된다. `DispatcherServlet`은 논리적 View 이름을 `ViewResolver`에 넘겨 실제 `View`를 찾고, 선택된 View가 Model을 사용해 HTML 같은 응답을 렌더링한다. `ViewResolver`는 Controller를 찾거나 Model을 만드는 구성 요소가 아니라 **View 이름을 렌더링 구현으로 해석하는 전략**이다.

### REST·`@ResponseBody` 경로

`@ResponseBody` 메서드나 이를 포함하는 `@RestController`가 객체를 반환하면 `RequestMappingHandlerAdapter`의 반환값 처리가 `HttpMessageConverter`를 선택해 JSON 같은 HTTP 응답 본문으로 직렬화한다. 이 경로는 응답이 `HandlerAdapter` 안에서 작성될 수 있으므로 논리적 View 이름도 `ViewResolver`도 필요하지 않다. 따라서 Spring MVC의 모든 Controller가 `ModelAndView`를 반환하거나 서버 렌더링 View를 만든다고 설명하면 REST Controller의 동작을 놓친다.

```java
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

record OrderResponse(long id, String status) {}

interface OrderQuery {
    OrderResponse find(long id);
}

@Controller
final class OrderPageController {
    private final OrderQuery orders;

    OrderPageController(OrderQuery orders) {
        this.orders = orders;
    }

    @GetMapping("/orders/{id}")
    String detail(@PathVariable("id") long id, Model model) {
        model.addAttribute("order", orders.find(id));
        return "orders/detail";
    }
}

@RestController
final class OrderApiController {
    private final OrderQuery orders;

    OrderApiController(OrderQuery orders) {
        this.orders = orders;
    }

    @GetMapping("/api/orders/{id}")
    OrderResponse detail(@PathVariable("id") long id) {
        return orders.find(id);
    }
}
```

`OrderPageController`의 문자열은 `ViewResolver`가 해석할 논리적 View 이름이고 Model의 `order`는 렌더링 데이터다. `OrderApiController`의 `OrderResponse`는 `@RestController` 때문에 응답 본문으로 처리되며, JSON 직렬화기처럼 해당 미디어 타입을 지원하는 `HttpMessageConverter`가 구성되어 있어야 한다. 두 클래스 모두 Spring MVC Controller지만 결과 처리 방식은 다르다.

## 장점과 한계

MVC 계열은 상태·표현·입력 조정의 변경 이유를 나눠 여러 개발자가 역할별로 작업하고 핵심 규칙을 UI 없이 테스트하기 쉽게 한다. MVP는 Presenter와 View 호출이 명시적이라 흐름을 따라가기 쉽고, MVVM은 바인딩 인프라가 잘 맞는 플랫폼에서 반복적인 화면 갱신 코드를 줄일 수 있다. Spring MVC의 `DispatcherServlet`은 공통 요청 처리 알고리즘과 매핑·실행·렌더링·예외 처리 전략을 분리해 다양한 Controller 반환 방식을 지원한다.

반면 화면이 작은데 계층과 인터페이스를 먼저 늘리면 탐색 비용만 커질 수 있다. MVC에서는 Model과 View가 서로 알림·조회로 연결되고 Controller까지 갱신에 참여하면 양방향 경로가 얽히며, MVP에서는 Presenter가 비대해지고, MVVM에서는 바인딩과 화면용 상태가 숨은 결합을 만들 수 있다. 패턴을 고를 때는 이름의 선호보다 플랫폼 지원, 상태 흐름의 복잡도, 단위 테스트와 UI 통합 테스트의 경계를 함께 판단해야 한다.

## 기술면접 질문

### MVC에서 Model, View, Controller의 책임은 무엇인가

MVC는 상태와 비즈니스 규칙, 화면 표현, 사용자 입력 조정의 책임을 Model, View, Controller로 분리합니다. Controller는 입력을 해석해 Model 작업을 호출하고 View는 그 결과를 표현하므로 변경 이유별 경계를 만들 수 있습니다. 다만 Controller에 모든 비즈니스 로직을 모으거나 View가 Model을 무분별하게 변경하면 역할 분리의 이점이 줄어듭니다.

### MVP와 MVVM의 핵심 차이는 무엇인가

MVP와 MVVM의 핵심 차이는 중간 역할이 View를 직접 갱신하는지 View가 노출된 상태에 바인딩하는지입니다. Presenter는 View 인터페이스의 메서드를 호출하지만 ViewModel은 상태와 Command를 제공하고 View의 바인딩이 이를 반영합니다. 예를 들어 Presenter는 가짜 View로 단위 테스트하기 쉽고 ViewModel은 상태만 테스트하기 쉽지만 실제 View 계약이나 바인딩 연결은 각각 통합 테스트가 필요합니다.

### DispatcherServlet은 어떤 역할을 하는가

DispatcherServlet은 Spring MVC 요청 처리의 공통 흐름을 지휘하는 프론트 컨트롤러입니다. HandlerMapping으로 핸들러를 찾고 HandlerAdapter로 실행한 뒤 반환값에 맞는 렌더링이나 예외 처리 전략을 연결합니다. 예를 들어 서버 렌더링 응답은 ViewResolver를 거치지만 `@ResponseBody` 응답은 HttpMessageConverter로 본문을 작성하므로 모든 요청이 View를 만드는 것은 아닙니다.

### MVC의 양방향 의존은 언제 복잡해지는가

MVC의 양방향 의존은 하나의 상태 변경이 여러 View와 Controller 사이를 되돌아다니며 갱신 순서를 예측하기 어려울 때 복잡해집니다. Model 알림, View의 직접 조회, Controller의 추가 갱신이 동시에 존재하면 같은 상태를 누가 언제 바꿨는지 추적하기 어려운지를 기준으로 분리 필요성을 판단합니다. 예를 들어 공유 Model을 여러 화면이 관찰하면서 각 화면 이벤트가 다시 Model을 바꾸면 순환 갱신을 막는 규칙이나 단방향 상태 흐름이 필요합니다.

## 복습 체크리스트

- [ ] MVC의 Model, View, Controller 책임과 변형별 참조 방향 차이를 설명할 수 있다.
- [ ] 같은 새 요구가 들어왔을 때 표현 로직 분리 전·후의 수정 범위를 비교할 수 있다.
- [ ] MVP의 View 계약 호출과 MVVM의 상태 바인딩을 테스트 경계까지 비교할 수 있다.
- [ ] 패턴 이름이 같아도 플랫폼별 생명주기와 바인딩 구현이 같지 않은 이유를 설명할 수 있다.
- [ ] DispatcherServlet, HandlerMapping, HandlerAdapter, Controller의 요청 흐름을 순서대로 설명할 수 있다.
- [ ] ViewResolver가 필요한 서버 렌더링과 HttpMessageConverter를 쓰는 응답 본문 처리를 구분할 수 있다.

## 참고 자료

- [인프런 — MVC패턴과 MVP패턴 그리고 MVVM패턴](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116060)
- [인프런 — Spring의 MVC패턴 적용사례](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=139952)
- [Spring Framework Reference — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Framework Reference — DispatcherServlet Processing](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)
- [Spring Framework Reference — `@ResponseBody`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)

---

이전: [옵저버 패턴과 프록시 패턴](/study/design-patterns/observer-and-proxy/) · [연재 목록](/study/design-patterns/) · 다음: Flux 패턴과 디자인 패턴 총정리
