---
title: 옵저버 패턴과 프록시 패턴
description: 상태 변경을 구독자에게 알리는 옵저버와 대상 접근을 중간에서 제어하는 프록시를 Java·Spring 예시로 구분합니다.
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, Observer, Proxy, Spring]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 6
---

## 핵심 요약

옵저버 패턴은 Subject의 상태 변경을 등록된 Observer 여러 개에게 통지해 발행자와 후속 처리를 분리한다. 프록시 패턴은 대상과 같은 계약을 제공하면서 대상에 닿기 전 접근 제어, 로깅 같은 정책을 적용한다. 두 패턴은 모두 간접 계층을 두지만, 여러 구독자에게 변화를 알리는 목적과 한 대상으로 가는 접근을 대리하는 목적은 다르다.

## 옵저버 패턴이 해결하는 문제

주문이 결제, 배송 중 같은 상태로 바뀐 뒤 이메일과 SMS를 보내야 한다고 하자. `Order` 안에 각 알림 구현의 생성과 호출을 직접 넣으면 주문 도메인 로직이 알림 채널 수, 생성자, 실패 처리를 모두 알게 된다. 알림이 하나 추가될 때마다 주문 상태 변경 코드까지 수정해야 하므로 변경 이유가 뒤섞인다.

옵저버 패턴은 Subject가 `OrderStatusObserver` 계약과 등록 목록만 알고, 구체 알림 채널은 Observer 구현으로 분리하게 한다. 이 구조에서 Subject는 스스로 변경을 완료한 뒤 등록된 대상을 호출하며, Observer가 Subject를 주기적으로 폴링한다는 뜻은 아니다.

### 새 알림 채널 요구의 변경 영향

| 구조 | 새 요구 사항: 카카오톡 알림 | 바뀌는 코드 |
| --- | --- | --- |
| 패턴 적용 전 | `Order` 안에서 이메일·SMS를 직접 호출 | `Order` 필드·생성·상태 변경 호출과 관련 테스트를 함께 수정 |
| 옵저버 적용 후 | `Order` 는 Observer 목록에 상태만 통지 | `KakaoOrderObserver`와 조합 코드에서의 등록을 추가하고, 통지 계약이 같다면 `Order`는 유지 |

패턴을 적용해도 상태 이벤트 계약 자체에 배송지 정보가 추가되면 계약과 모든 Observer가 영향을 받을 수 있다. 패턴은 변경을 없애지 않고, 새 구독자 추가라는 변화가 Subject 내부로 퍼지지 않는 경계를 만든다.

## Subject와 Observer의 흐름

```java
import java.util.ArrayList;
import java.util.List;

enum OrderStatus { PAID, SHIPPED }

interface OrderStatusObserver {
    void update(String orderId, OrderStatus status);
}

final class EmailOrderObserver implements OrderStatusObserver {
    @Override
    public void update(String orderId, OrderStatus status) {
        System.out.println("email: " + orderId + " -> " + status);
    }
}

final class SmsOrderObserver implements OrderStatusObserver {
    @Override
    public void update(String orderId, OrderStatus status) {
        System.out.println("sms: " + orderId + " -> " + status);
    }
}

final class Order {
    private final String id;
    private final List<OrderStatusObserver> observers = new ArrayList<>();
    private OrderStatus status;

    Order(String id) {
        this.id = id;
    }

    void subscribe(OrderStatusObserver observer) {
        observers.add(observer);
    }

    void unsubscribe(OrderStatusObserver observer) {
        observers.remove(observer);
    }

    void changeStatus(OrderStatus newStatus) {
        status = newStatus;
        for (OrderStatusObserver observer : List.copyOf(observers)) {
            observer.update(id, status);
        }
    }
}

final class ObserverExample {
    public static void main(String[] args) {
        Order order = new Order("A-100");
        order.subscribe(new EmailOrderObserver());
        order.subscribe(new SmsOrderObserver());
        order.changeStatus(OrderStatus.SHIPPED);
    }
}
```

`Order` 자체가 Subject이며 `subscribe`, `unsubscribe`, 상태 변경 후 통지 책임을 가진다. 호출 흐름은 `changeStatus` → 상태 갱신 → Observer 목록 순회 → 각 `update` 호출 순서다. 예시는 이벤트 데이터를 인자로 보내는 push 방식이며, Observer가 Subject에서 새 상태를 다시 조회하는 pull 방식도 있다.

동기 통지에서 한 Observer가 예외를 던지거나 오래 걸리면 나머지 통지와 주문 처리까지 영향을 받을 수 있다. 실무에서는 Observer별 실패 격리, 재시도, 이벤트 큐 사용 여부를 일관성 요구와 함께 결정해야 한다. 또한 더 이상 통지가 필요 없은 Observer를 `unsubscribe`하지 않으면 원치 않는 알림이 계속되거나 Subject의 참조 때문에 객체 정리가 늦어질 수 있다.

## 프록시 패턴이 해결하는 문제

여러 호출부가 실제 `PaymentClient`를 바로 사용하면 로깅과 접근 제어를 각각 중복하거나 외부 결제 통신 코드 안에 섞어 넣게 된다. 프록시가 실제 클라이언트와 같은 `PaymentClient` 계약을 구현하면 호출부는 대상인지 프록시인지 구분하지 않고 `pay` 메서드를 사용할 수 있다. 프록시는 요청을 먼저 받아 정책을 적용한 뒤 허용된 호출만 실제 대상에 위임한다.

```java
interface PaymentClient {
    void pay(String orderId, int amount);
}

final class RealPaymentClient implements PaymentClient {
    @Override
    public void pay(String orderId, int amount) {
        System.out.println("remote payment: " + orderId + ", " + amount);
    }
}

final class PaymentClientProxy implements PaymentClient {
    private final PaymentClient target;
    private final boolean paymentAllowed;

    PaymentClientProxy(PaymentClient target, boolean paymentAllowed) {
        this.target = target;
        this.paymentAllowed = paymentAllowed;
    }

    @Override
    public void pay(String orderId, int amount) {
        System.out.println("payment request: " + orderId);
        if (!paymentAllowed) {
            throw new SecurityException("payment is not allowed");
        }
        target.pay(orderId, amount);
    }
}

final class ProxyExample {
    public static void main(String[] args) {
        PaymentClient client = new PaymentClientProxy(
            new RealPaymentClient(), true
        );
        client.pay("A-100", 10_000);
    }
}
```

`PaymentClientProxy` 자체도 `PaymentClient`이므로 기존 호출부의 메서드 호출 모양은 유지된다. 이 예시의 순서는 로그 남김 → 권한 확인 → 실제 클라이언트 위임이며, 접근이 거부되면 외부 결제 호출은 일어나지 않는다. 운영 코드에서는 불리언 대신 호출자 정보와 권한 정책을 받고, 결제 정보처럼 민감한 값은 로그에 남기지 않아야 한다.

### 새 접근 정책 요구의 변경 영향

| 구조 | 새 요구 사항: 운영자만 고액 결제 허용 | 바뀌는 코드 |
| --- | --- | --- |
| 패턴 적용 전 | 각 호출부가 로그·권한 검사 후 실제 클라이언트 호출 | 모든 호출부의 분기와 테스트를 수정하거나 `RealPaymentClient`에 정책을 혼합 |
| 프록시 적용 후 | 호출부는 `PaymentClient` 계약으로 프록시 사용 | `PaymentClientProxy`의 권한 정책과 조합 설정을 수정하고, 계약이 같다면 호출부와 실제 클라이언트는 유지 |

호출부가 `new RealPaymentClient()`를 직접 생성하면 프록시를 우회할 수 있으므로 조합 지점에서 프록시만 노출하는 구조가 필요하다. 또한 `pay` 계약에 통화 정보를 추가하는 변경은 프록시와 실제 대상, 호출부 모두에 전파된다.

## 객체 프록시와 프록시 서버

객체 프록시와 네트워크 프록시 서버의 공통점은 클라이언트와 실제 대상 사이에서 요청을 대신 받는다는 것이다. 하지만 하나는 프로세스 안의 객체 호출 구조이고 다른 하나는 별도 프로세스·호스트에서 네트워크 트래픽을 처리하는 인프라이므로 같은 구현으로 보면 안 된다.

| 구분 | 객체 프록시 | 네트워크 프록시 서버 |
| --- | --- | --- |
| 경계 | 하나의 애플리케이션 프로세스 안 | 클라이언트와 원본 서버 사이의 네트워크 |
| 계약 | Java 인터페이스·클래스의 메서드 | HTTP, TLS, TCP 같은 네트워크 프로토콜 |
| 대표 처리 | 권한 검사, 지연 생성, 캐시, 로깅 | 라우팅, TLS 종료, 트래픽 필터링·속도 제한 |
| 위 예시와의 관계 | `PaymentClient` 계약을 공유하는 Java 객체 | `PaymentClient` 인터페이스를 구현할 필요가 없는 배포 구성 요소 |

HTTP → HTTPS 전환에서 리버스 프록시는 평문 HTTP 요청에 HTTPS 리다이렉트를 응답하고, HTTPS 연결의 TLS를 종료한 뒤 원본 서버로 요청을 전달할 수 있다. DDoS 방어에서는 원본 앞의 프록시·CDN 계층이 공격 트래픽을 식별하고 차단하거나 속도를 제한해 원본이 직접 받는 부하를 줄인다. 이는 인프라 구성과 프로토콜 처리의 문제이며, Java 객체를 같은 인터페이스로 감싼 코드 예시와 동일한 구현은 아니다.

## Spring AOP에서의 프록시

Spring AOP는 트랜잭션, 로깅 같이 여러 대상에 반복되는 횡단 관심사를 대상 코드에 직접 섞지 않고 적용하기 위해 프록시 기반 메서드 가로채기를 사용한다. 클라이언트가 대상 대신 프록시 참조를 호출하면 프록시가 해당 메서드의 advice를 실행하고 실제 대상으로 위임한다.

Spring Framework의 일반 선택 규칙은 대상이 인터페이스를 하나 이상 구현하면 **JDK dynamic proxy**, 구현한 인터페이스가 없으면 **CGLIB proxy**를 만드는 것이다. JDK dynamic proxy는 대상이 구현한 인터페이스들을 프록시하므로, 클라이언트가 구체 클래스에만 있는 메서드까지 같은 프록시 계약으로 사용할 수 있다고 가정하면 안 된다. CGLIB는 대상 타입의 런타임 하위 클래스를 만들어 재정의 가능한 메서드를 가로채지만, `final` 클래스를 프록시할 수 없고 `final`·`private` 메서드에 advice를 적용할 수 없다.

`proxy-target-class` 같은 설정으로 클래스 기반 프록시를 강제할 수 있고 Spring Boot의 기본값은 구성에 따라 다를 수 있으므로, 인터페이스 존재만 보고 운영 프록시 타입을 단정하지 않고 실제 설정을 확인한다. 또한 대상 메서드 안의 `this.otherMethod()`는 프록시가 아닌 대상 자신을 호출하므로 advice를 우회한다. 프록시 기반 AOP의 효과를 기대하는 메서드는 외부에서 프록시 참조를 통해 호출되도록 경계를 설계해야 한다.

## 두 패턴의 차이

| 구분 | 옵저버 패턴 | 프록시 패턴 |
| --- | --- | --- |
| 목적 | Subject의 상태 변경을 여러 구독자에게 전파 | 대상 접근을 대리하고 정책 적용 |
| 주요 참여자 | Subject, Observer 계약, 여러 Observer | Subject 계약, Proxy, Real Subject, Client |
| 흐름 | 한 Subject에서 여러 Observer로 통지 | Client에서 Proxy를 거쳐 한 대상으로 위임 |
| 숨기는 변화 | 구독자의 종류·수 | 접근 정책·생성 시점·원격 위치 |
| 주의점 | 구독 해제, 통지 순서, 오류 격리 | 프록시 우회, 추가 지연, 대상과의 계약 일치 |

옵저버의 Observer는 이벤트를 받아 각자의 후속 작업을 수행하며 Subject를 대신하지 않는다. 반면 프록시는 실제 대상과 같은 계약을 노출해 클라이언트에게 대상의 대리자로 보인다.

프록시와 데코레이터는 같은 계약으로 대상을 감싼다는 구조가 비슷하지만 의도로 구분한다. 프록시는 대상에 닿는 방식을 제어하거나 대리하는 것이 중심이고, 데코레이터는 객체에 책임을 조합해 기능을 덧붙이는 것이 중심이다. 로깅처럼 양쪽으로 해석할 수 있는 책임은 구조만 보고 이름 붙이지 말고 클라이언트에게 제공하는 설계 의도를 보아야 한다.

## 장점과 한계

옵저버 패턴은 Subject가 구체 후속 처리를 모르게 하고 실행 중에도 구독자를 등록·해제할 수 있게 한다. 반면 통지 순서가 로직에 영향을 주거나, 다수 Observer의 실행 비용이 커지거나, 해제 누락으로 생명주기 문제가 생길 수 있다. 비동기 이벤트로 바꾸면 결합도는 더 낮출 수 있지만 즉시 일관성과 실패 추적을 별도로 설계해야 한다.

프록시 패턴은 대상 코드를 수정하지 않고 권한, 캐시, 로깅, 원격 위치 같은 접근 정책을 한 경계에 둘 수 있다. 하지만 위임 계층이 늘어 디버깅 경로와 지연이 추가되고, 클라이언트가 실제 대상을 직접 확보하면 정책이 우회된다. 프록시에 변경 감지·캐싱·인증·재시도를 모두 모으면 또 다른 거대 클래스가 되므로 정책의 조합 방식과 책임 경계를 관리해야 한다.

## 기술면접 질문

### 옵저버는 어떻게 느슨한 결합을 만들고, 구독 해제를 놓치면 어떤 문제가 생기는가

옵저버 패턴은 Subject가 구체 알림 채널 대신 Observer 계약에 의존하게 해 발행자와 구독자를 느슨하게 결합합니다. Subject는 등록 목록을 순회해 상태 변화를 통지하므로 새 채널은 새 구현을 등록하는 방식으로 추가할 수 있습니다. 다만 구독 해제를 놓치면 더 이상 필요 없는 객체가 참조되거나 원치 않는 알림을 계속 받으므로 생명주기 관리가 필요합니다.

### 프록시 패턴의 목적은 무엇인가

프록시의 목적은 대상과 같은 계약을 제공하면서 대상 접근을 대신 제어하는 것입니다. 클라이언트 호출을 먼저 받아 권한 검사, 지연 생성, 캐시, 원격 호출 같은 정책을 수행한 뒤 실제 대상에 위임합니다. 예를 들어 결제 프록시는 로그와 권한 검사를 적용할 수 있지만, 모든 호출이 프록시를 거치도록 조합하지 않으면 정책이 우회됩니다.

### 프록시와 데코레이터의 차이는 무엇인가

프록시와 데코레이터는 같은 계약으로 대상을 감싸 위임할 수 있지만 주된 의도가 다릅니다. 프록시는 접근 제어·지연·원격 대리처럼 대상에 닿는 방식을 관리하고, 데코레이터는 객체의 책임을 조합해 기능을 덧붙입니다. 로깅처럼 양쪽으로 해석될 수 있는 예도 있으므로 클래스 모양만 보지 말고 클라이언트에게 보이는 설계 의도로 판단해야 합니다.

### Spring AOP는 왜 프록시를 사용하는가

Spring AOP는 횡단 관심사를 대상 코드와 분리해 메서드 호출 앞뒤에 적용하기 위해 프록시를 사용합니다. 클라이언트가 프록시를 호출하면 advice 실행 후 대상으로 위임하며, Spring Framework의 일반 선택은 인터페이스가 있으면 JDK dynamic proxy이고 없으면 CGLIB 하위 클래스 방식입니다. 다만 자기 호출은 advice를 우회하고 CGLIB도 `final` 클래스와 `final`·`private` 메서드를 가로챌 수 없으므로 코드 경계와 프록시 설정을 확인해야 합니다.

## 복습 체크리스트

- [ ] Subject의 상태 변경이 등록된 Observer들에게 전파되는 흐름을 설명할 수 있다.
- [ ] 새 알림 채널이 추가될 때 옵저버 적용 전·후의 코드 변경 범위를 비교할 수 있다.
- [ ] 객체 프록시와 네트워크 프록시 서버의 경계·계약·구현 차이를 설명할 수 있다.
- [ ] JDK dynamic proxy와 CGLIB proxy의 선택 기준, 노출 범위, 재정의 한계를 구분할 수 있다.
- [ ] Spring AOP에서 자기 호출이 advice를 우회하는 이유를 설명할 수 있다.
- [ ] 새 접근 정책이 추가될 때 프록시 적용 전·후의 변경 범위를 비교할 수 있다.

## 참고 자료

- [인프런 — 옵저버 패턴](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116058)
- [인프런 — 프록시 패턴](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=116059)
- [Spring Framework Reference — Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)

---

이전: [DI·DIP와 전략 패턴](/study/design-patterns/dependency-injection-and-strategy/) · [연재 목록](/study/design-patterns/) · 다음: [MVC·MVP·MVVM과 Spring MVC](/study/design-patterns/mvc-mvp-mvvm/)
