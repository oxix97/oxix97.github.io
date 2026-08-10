---
title: 팩토리 패턴과 이터레이터 패턴
description: 객체 생성 결정과 컬렉션 순회를 각각 분리하는 팩토리·이터레이터 패턴을 Java 예시와 변경 영향으로 정리합니다.
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, Factory, Iterator]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 4
---

## 핵심 요약

팩토리 패턴은 클라이언트가 구체 클래스와 생성 절차를 직접 결정하지 않도록 객체 생성 결정을 분리한다. 이터레이터 패턴은 컬렉션의 저장 구조를 드러내지 않은 채 같은 순회 인터페이스를 제공한다. 전자는 **무엇을 만들지** 바뀌는 지점을, 후자는 **어떻게 저장·탐색하는지** 바뀌는 지점을 감추므로 같은 종류의 문제를 푸는 패턴으로 보면 안 된다.

## 팩토리 패턴이 해결하는 문제

알림을 보낼 때 호출부가 `new EmailNotification()`과 `new SmsNotification()`을 직접 선택하면 채널 추가, 생성 인자 변경, 초기화 절차 변경이 모든 호출부로 퍼질 수 있다. 팩토리에 생성 결정을 모으면 호출부는 `Notification`이라는 추상화에만 의존하고, 채널별 생성 규칙은 한곳에서 관리한다.

강의에서 말하는 "팩토리 패턴"은 상위 흐름이 객체 생성을 요청하고 구체 생성 로직을 분리해 유연성과 유지 보수성을 얻는 넓은 의미로 이해할 수 있다. 아래 예시는 선택과 생성을 하나의 클래스에 모은 **단순 팩토리 형태**다. GoF의 Factory Method는 보통 Creator의 팩토리 메서드를 하위 Creator가 재정의해 구체 Product 생성을 결정하는 구조이므로, 이 예시를 그 구조와 동일하다고 부르지는 않는다.

## 팩토리 패턴의 구조와 예시

```java
interface Notification {
    void send(String message);
}

final class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("email: " + message);
    }
}

final class SmsNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("sms: " + message);
    }
}

enum Channel { EMAIL, SMS }

final class NotificationFactory {
    Notification create(Channel channel) {
        return switch (channel) {
            case EMAIL -> new EmailNotification();
            case SMS -> new SmsNotification();
        };
    }
}
```

호출 코드는 `new NotificationFactory().create(Channel.EMAIL)`로 `Notification`을 받고 `send()`만 호출한다. 새 채널을 넣을 때는 `Notification` 구현과 팩토리의 선택 규칙을 수정하지만, 이미 추상화만 쓰는 호출부는 바꾸지 않는다.

## 이터레이터 패턴이 해결하는 문제

주문 목록이 `List`인지 배열인지, 혹은 페이지 기반 저장소인지에 따라 호출부가 인덱스·키·내부 자료구조를 알아야 한다면 저장 방식을 바꿀 때 순회 코드도 함께 흔들린다. 이터레이터는 `hasNext()`와 `next()`라는 순회 규약을 제공하고, Java에서는 `Iterable<T>`를 구현하면 `for-each`가 그 규약을 사용한다.

이는 배열, 집합, 맵처럼 구조가 다른 컨테이너도 일관된 방식으로 탐색하게 한다는 강의의 요점과 맞닿아 있다. 다만 이터레이터가 특정 요소를 찾는 알고리즘이나 컬렉션의 동시 수정 정책까지 자동으로 해결해 주는 것은 아니다.

## 이터레이터 패턴의 구조와 예시

```java
import java.util.Iterator;
import java.util.List;

record Order(String id) {}

final class OrderHistory implements Iterable<Order> {
    private final List<Order> orders;

    OrderHistory(List<Order> orders) {
        this.orders = List.copyOf(orders);
    }

    @Override
    public Iterator<Order> iterator() {
        return orders.iterator();
    }
}

OrderHistory history = new OrderHistory(List.of(
    new Order("A-100"), new Order("A-101")
));

for (Order order : history) {
    System.out.println(order.id());
}
```

`OrderHistory`는 내부에 `List<Order>`를 쓰지만 `getOrders()`를 노출하지 않는다. 호출부는 `Iterable<Order>`와 `for-each`를 통해 순회하므로, 내부를 다른 순회 가능한 구조로 바꾸더라도 순회 규약을 유지하면 호출 코드는 그대로 둘 수 있다.

## 두 패턴의 차이

| 구분 | 목적 | 숨기는 변화 | 주요 참여자 |
| --- | --- | --- | --- |
| 팩토리 패턴 | 클라이언트에서 객체 생성 결정 분리 | 구체 타입 선택, 생성 인자, 초기화 절차 | Client, Factory, `Notification`, 구체 Notification |
| 이터레이터 패턴 | 컬렉션을 같은 방식으로 순회 | 저장 구조, 탐색 위치 이동 방식 | Client, `Iterable<Order>`, `Iterator<Order>`, `OrderHistory` |

변경 영향도 다르다. `PushNotification`을 추가하면 팩토리의 선택 분기와 새 구현이 바뀌고, 내부 저장소를 `List`에서 다른 구조로 바꾸면 `OrderHistory.iterator()` 구현이 바뀐다. 각각의 클라이언트가 `Notification`과 `Iterable<Order>`라는 경계만 사용하면 두 변화는 호출부까지 전파되지 않는다.

## 장점과 한계

팩토리는 생성 규칙을 한곳에 두어 구현 교체와 초기화 절차 변경의 범위를 줄이며, 클라이언트가 구체 타입 대신 인터페이스를 사용하게 돕는다. 그러나 채널 수가 늘어날수록 단순 팩토리의 `switch`는 수정 대상이 되므로, 확장 방식과 등록 구조가 실제로 필요한지 판단해야 한다.

이터레이터는 내부 컬렉션을 노출하지 않고 표준 순회 문법을 제공해 호출부의 결합도를 낮춘다. 반면 순회 중 변경을 허용할지, 한 번만 순회할지, 대용량 데이터에서 지연 조회가 필요한지는 `Iterator`만으로 결정되지 않으므로 컬렉션 계약을 별도로 정해야 한다.

## 기술면접 질문

### 객체 생성을 분리하면 어떤 이점을 얻는가

팩토리에 객체 생성 결정을 모으면 클라이언트가 구체 클래스와 생성 절차를 직접 알 필요가 없습니다. 따라서 구현 교체나 생성 인자 변경은 주로 팩토리와 해당 구현 안에 머물고, 호출부는 인터페이스를 계속 사용할 수 있습니다. 다만 단순 팩토리에 분기가 계속 늘어나면 그 클래스가 변경 집중점이 되므로 확장 요구를 함께 평가해야 합니다.

### 팩토리와 생성자 직접 호출은 언제 선택하는가

생성 절차가 단순하고 한 곳에서만 쓰이며 구체 타입 교체 가능성이 낮다면 생성자 직접 호출이 더 읽기 쉽습니다. 런타임 조건에 따라 구현을 고르거나 초기화가 복잡하고 여러 호출부에서 재사용된다면 팩토리로 생성 결정을 분리합니다. 이때 "팩토리"라는 넓은 표현과 단순 팩토리, GoF Factory Method의 구체 구조를 구분해 현재 코드의 형태를 설명합니다.

### 이터레이터는 컬렉션 내부 구조를 어떻게 감추는가

컬렉션은 `Iterable<Order>`를 구현하고 `iterator()`로 `Iterator<Order>`를 제공해 순회 규약만 외부에 노출합니다. 호출부는 `for-each`나 이터레이터의 `hasNext()`와 `next()`를 사용하므로 인덱스나 실제 저장 컨테이너를 알 필요가 없습니다. 내부 저장 구조를 바꾸더라도 같은 순회 규약과 요소 순서 계약을 유지하면 호출부 변경을 줄일 수 있습니다.

## 복습 체크리스트

- [ ] 팩토리가 구체 타입 선택과 생성 절차의 변화를 호출부에서 분리하는 이유를 설명할 수 있다.
- [ ] 넓은 의미의 팩토리, 단순 팩토리 형태, GoF Factory Method의 차이를 과장하지 않고 설명할 수 있다.
- [ ] `Iterable<T>`와 `Iterator<T>`가 내부 컬렉션을 노출하지 않고 순회를 제공하는 과정을 설명할 수 있다.
- [ ] 알림 채널 추가와 주문 저장 구조 변경이 각각 어느 경계에 영향을 주는지 판단할 수 있다.

## 참고 자료

- [인프런 — 팩토리패턴](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=118502)
- [인프런 — 이터레이터패턴](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=118503)
- [Java SE API — Iterable](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Iterable.html)
- [Java SE API — Iterator](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Iterator.html)

---

이전: [싱글톤 구현 방식 비교](/study/design-patterns/singleton-implementations/) · [연재 목록](/study/design-patterns/) · 다음: DI·DIP와 전략 패턴
