---
title: DI·DIP와 전략 패턴
description: 직접 의존의 변경 영향을 줄이는 DIP와 DI, 교체 가능한 결제 행동을 캡슐화하는 전략 패턴을 Java·Spring 예시로 구분합니다.
slug: study/design-patterns/dependency-injection-and-strategy
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, Dependency Injection, Strategy, Spring]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 5
---

카드 결제만 지원하던 주문 서비스에 계좌 이체를 추가한다고 해 보자. 주문 서비스가 카드 결제 코드를 직접 만들고 사용한다면 주문 서비스도 고쳐야 한다. 이 글은 같은 결제 예제를 통해 ‘무엇에 의존할지’, ‘누가 객체를 전달할지’, ‘어떤 행동을 바꿀지’를 나누어 살펴본다.

## 핵심 요약

세 개념은 함께 쓰일 수 있지만 답하는 질문이 다르다.

- **DIP는 어떤 기능에 의존할지 정하는 원칙이다.** 주문 서비스가 특정 카드 회사의 기능 대신 ‘결제한다’는 공통 약속을 사용하도록 설계한다.
- **DI는 필요한 객체를 외부에서 받는 방법이다.** 주문 서비스가 카드 결제 객체를 직접 만들지 않고 생성자 등으로 전달받는다.
- **전략 패턴은 같은 목적의 행동을 교체하는 구조다.** 카드 결제와 계좌 이체를 같은 결제 약속을 지키는 구현으로 두고 골라 사용한다.

정식 이름은 의존관계 역전 원칙(Dependency Inversion Principle, DIP)과 의존성 주입(Dependency Injection, DI)이다. DIP는 **원칙**, DI는 **구현 방법**, 전략은 **디자인 패턴**이라는 차이를 기억하고 예제를 읽으면 된다. 외부에서 객체를 받았다는 사실만으로 세 가지를 모두 적용한 것은 아니다.

## 직접 의존이 만드는 문제

여기서 의존한다는 말은 다른 객체의 기능이 있어야 내 작업을 할 수 있다는 뜻이다. `CheckoutService`는 주문을 처리하려고 카드 결제 기능을 사용한다. 아래 코드의 `new CardPaymentStrategy()`를 보면 어떤 결제 객체를 만들지 주문 서비스가 직접 결정하고 있다.

```java
final class CheckoutService {
    private final CardPaymentStrategy paymentStrategy =
        new CardPaymentStrategy();

    void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}
```

이 구조에서 계좌 이체를 추가하려면 `CheckoutService`에 선택 분기를 넣거나 필드 타입과 생성 코드를 바꿔야 한다. 카드 구현의 생성자에 인증 정보가 추가되어도 서비스가 함께 수정된다. 테스트에서 실제 카드 구현을 대역으로 바꾸기도 어렵다. 즉 하위 세부사항의 변화가 결제 흐름을 조정하는 상위 코드까지 전파된다.

생성과 사용을 분리하면 영향 범위가 달라진다. `CheckoutService`가 `PaymentStrategy` 계약만 받고 외부 조합 지점이 `CardPaymentStrategy`를 제공하도록 만들 수 있다. 그러면 계좌 이체 추가는 새 전략 구현과 조합 설정에 머물고 기존 체크아웃 흐름은 바뀌지 않는다.

계약은 사용 가능한 메서드와 그 의미에 대한 약속이다. 이 예제에서는 금액을 받아 결제하는 `pay(int amount)`가 그 약속이다. 카드 회사마다 다른 내부 절차를 감추고 필요한 기능만 드러내는 것을 추상화라고 한다.

계약 자체가 바뀌면 영향 범위도 달라진다. `pay`에 통화 매개변수를 추가하면 모든 전략과 이를 호출하는 컨텍스트가 영향을 받는다. 환불 기능은 기존 계약에 새 메서드로 넣거나 별도의 `RefundStrategy`로 분리할 수 있다. 별도 계약으로 분리하면 결제만 사용하는 `CheckoutService`는 바뀌지 않는다. 추상화는 **어느 변화가 어디까지 전파되는지 정하는 경계**다.

## DIP는 원칙이고 DI는 구현 방법이다

주문 흐름처럼 ‘무엇을 할지’를 정하는 코드를 상위 정책, 카드 회사의 SDK처럼 ‘특정 기술로 어떻게 할지’를 처리하는 코드를 하위 세부 구현이라고 부른다. SDK는 외부 서비스가 제공하는 개발용 도구 모음이다.

아래 그림은 실행 순서가 아니라 코드가 어떤 타입을 사용하는지 나타낸다. 화살표 옆의 ‘사용’과 ‘구현’을 구분해서 읽어야 한다.

<figure class="study-diagram study-diagram--pattern">
  <img src="/images/study/design-pattern/dip-dependencies.svg" width="480" height="668" alt="변경 전에는 CheckoutService가 CardPaymentStrategy를 직접 사용한다. 변경 후에는 CheckoutService가 PaymentStrategy를 사용하고 CardPaymentStrategy가 그 계약을 구현한다." loading="lazy" decoding="async" />
  <figcaption>상위 정책이 요구하는 결제 계약을 두고 카드별 세부 구현이 그 계약에 맞추게 한다.</figcaption>
</figure>

DIP의 핵심은 상위 수준의 결제 정책이 카드 SDK 같은 하위 세부 구현을 직접 알지 않고, 둘 다 `PaymentStrategy`라는 추상화에 의존하게 만드는 것이다. 추상화가 카드 SDK의 메서드 모양을 그대로 복제한다면 세부사항이 추상화를 지배하므로 의존 방향만 인터페이스처럼 보일 뿐 원칙의 효과는 약하다. 계약은 `pay(int amount)`처럼 체크아웃 도메인이 필요한 행동을 표현하고, 카드별 호출 방식은 구현 안에 둔다.

DI는 필요한 객체를 생성자, 메서드 또는 설정을 통해 외부에서 전달하는 방법이다. ‘주입’은 여기서 객체를 전달한다는 뜻이다. 객체들을 만들고 연결하는 코드를 조합 지점이라고 부른다.

구체 타입인 `CardPaymentStrategy`를 외부에서 주입해도 생성 책임은 분리된다. 하지만 주문 서비스가 여전히 그 구체 타입을 사용한다면 DIP를 충족한다고 단정할 수 없다. 반대로 조합 지점이 직접 `new CheckoutService(new CardPaymentStrategy())`를 호출해도, 주문 서비스가 `PaymentStrategy`에 의존하면 DI와 DIP를 프레임워크 없이 적용할 수 있다.

| 분류 | 주목적 | 교체 대상 | 사용 시점 |
| --- | --- | --- | --- |
| DI | 객체 생성과 사용을 분리해 의존성을 외부에서 제공 | 저장소, 클라이언트, 전략 등 객체가 필요로 하는 협력자 | 생성 책임을 조합 지점이나 컨테이너에 두고 테스트·설정별 구현을 바꿀 때 |
| DIP | 상위 정책과 하위 세부사항이 안정적인 추상화에 의존하도록 방향 설정 | 구체 구현을 향한 컴파일 타임 의존 | 세부 기술의 변화가 상위 정책으로 전파되는 구조를 재설계할 때 |
| 전략 패턴 | 같은 목적의 교체 가능한 행동을 공통 계약으로 캡슐화 | 결제, 정렬, 인증처럼 선택 가능한 알고리즘 또는 정책 | 실행 조건이나 설정에 따라 같은 작업의 수행 방식을 바꿀 때 |

## 전략 패턴과 컨텍스트

다음 그림은 객체를 준비하고 사용하는 순서다. 앞의 의존 관계 그림과 달리, 누가 실제 객체를 만들어 전달하는지 보여 준다.

<figure class="study-diagram study-diagram--pattern">
  <img src="/images/study/design-pattern/strategy-injection.svg" width="480" height="542" alt="조합 코드가 CardPaymentStrategy를 만들고 CheckoutService 생성자에 전달한다. CheckoutService는 checkout에서 전달받은 전략의 pay를 호출한다." loading="lazy" decoding="async" />
  <figcaption>결제 행동을 교체할 수 있는 구조가 전략 패턴이고, 선택한 객체를 생성자로 전달하는 부분이 DI다.</figcaption>
</figure>

전략 패턴에서 **컨텍스트(Context)** 는 전략을 사용해 작업을 수행하는 객체이며, 이 글에서는 `CheckoutService`가 해당한다. 컨텍스트는 결제 전후의 체크아웃 흐름을 알고, 실제 결제 방식은 `PaymentStrategy`에 위임한다. `CardPaymentStrategy`와 이후 추가할 계좌 이체 전략은 같은 계약을 지키므로 컨텍스트는 구체 알고리즘을 몰라도 된다.

```java
interface PaymentStrategy {
    void pay(int amount);
}

final class CardPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay(int amount) {
        System.out.println("card: " + amount);
    }
}

final class CheckoutService {
    private final PaymentStrategy paymentStrategy;

    CheckoutService(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}
```

주의할 점은 컨텍스트가 분야마다 같은 뜻이 아니라는 것이다. 운영체제에서는 중단된 작업을 재개하는 데 필요한 상태를 가리킬 수 있고, 프론트엔드의 Context API에서는 컴포넌트가 값을 공유하는 메커니즘을 뜻하므로 현재 도메인을 먼저 밝혀야 한다.

## 전략 패턴과 DI의 차이

전략 패턴과 DI는 구체 구현을 외부에서 바꾸기 쉽게 만든다는 공통점이 있어 한 코드에서 함께 나타날 수 있다. 위 예시에서 `PaymentStrategy`와 여러 결제 구현은 교체 가능한 행동을 표현하는 전략 패턴이고, `CheckoutService` 생성자로 선택한 구현을 전달하는 부분은 DI다.

그러나 모든 DI 대상이 전략인 것은 아니다. 데이터베이스 연결이나 로깅 클라이언트를 주입하는 목적은 객체의 협력자를 외부에서 제공하는 데 있으며, 같은 작업을 수행하는 알고리즘의 선택을 모델링하지 않을 수 있다. 반대로 전략은 메서드 인자로 매번 전달하거나 컨텍스트 내부의 명시적인 선택 규칙으로 바꿀 수도 있어 DI 컨테이너가 필수는 아니다.

생성자 주입은 한 `CheckoutService` 인스턴스가 사용할 기본 전략을 조립할 때 알맞다. 주문마다 결제 수단을 런타임에 선택해야 한다면 `PaymentStrategy` 목록을 주입해 키로 고르거나, 별도 선택 객체를 두거나, 호출 시 전략을 전달하는 구조를 요구사항에 맞게 선택한다. "전략을 주입했다"는 사실과 "언제 어떤 전략을 선택한다"는 정책을 분리해야 변경 지점을 정확히 볼 수 있다.

## Spring 생성자 주입 예시

여기부터는 같은 객체 전달을 Spring에 맡긴다. 앞의 일반 Java 예제로 관계를 이해했다면, `@Component`와 `@Service`가 붙은 객체를 Spring이 찾고 생성자로 연결한다는 차이를 보면 된다. Spring이 관리하는 객체를 빈(bean), 그 객체들을 생성하고 연결하는 주체를 컨테이너라고 한다.

```java
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

interface PaymentStrategy {
    void pay(int amount);
}

@Component
final class CardPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay(int amount) {
        System.out.println("card: " + amount);
    }
}

@Service
final class CheckoutService {
    private final PaymentStrategy paymentStrategy;

    CheckoutService(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}
```

Spring 컨테이너가 두 클래스를 빈으로 발견하면 `CheckoutService`의 유일한 생성자에 타입이 맞는 `PaymentStrategy` 빈을 전달한다. 대상 빈에 생성자가 하나뿐이면 생성자에 `@Autowired`를 붙이지 않아도 된다. 예시에는 `PaymentStrategy` 구현이 하나라 주입 대상도 모호하지 않다. 구현이 여러 개라면 `@Qualifier`, `@Primary`, 설정 클래스 또는 별도 선택 정책으로 대상을 명시해야 한다. 이 선택은 전략 패턴 자체와 구분되는 조합 책임이다.

테스트에서는 Spring 컨테이너를 띄우지 않고도 생성자에 대역을 넣을 수 있다. 대역은 실제 카드 결제 대신 테스트에 필요한 동작만 수행하는 객체다. 아래의 `RecordingPaymentStrategy`는 실제 결제 없이 전달된 금액만 기록한다. `paidAmount`에 `10_000`이 남는지 확인하는 부분을 보면 테스트의 목적을 알 수 있다.

```java
final class RecordingPaymentStrategy implements PaymentStrategy {
    int paidAmount;

    @Override
    public void pay(int amount) {
        paidAmount = amount;
    }
}

final class CheckoutServiceTest {
    public static void main(String[] args) {
        RecordingPaymentStrategy strategy =
            new RecordingPaymentStrategy();
        CheckoutService service = new CheckoutService(strategy);
        service.checkout(10_000);

        if (strategy.paidAmount != 10_000) {
            throw new AssertionError("expected 10000, but was "
                + strategy.paidAmount);
        }
    }
}
```

이 테스트는 체크아웃이 결제 행동에 정확한 금액을 위임하는지 빠르게 확인하며 네트워크나 카드 SDK에 의존하지 않는다. 생성자에서 필수 협력자가 드러나므로 테스트 준비도 명시적이지만, 대역이 실제 구현의 통합 오류까지 검증해 주는 것은 아니므로 별도의 통합 테스트가 필요하다.

## 장점과 한계

DIP와 DI를 함께 적용하면 상위 정책이 구체 기술의 생성 방식에서 떨어지고, 구현 교체와 단위 테스트의 변경 범위를 줄일 수 있다. 전략 패턴은 조건문에 흩어진 알고리즘을 각각의 구현으로 모아 행동별 테스트와 확장을 쉽게 만든다. 조합 지점에서 어떤 구현이 사용되는지도 명시하면 운영 환경별 구성을 추적하기 쉬워진다.

반면 작은 행동 하나마다 인터페이스와 구현을 만들면 파일 수와 탐색 비용이 늘고, 실제 교체 가능성이 없는 코드가 과도하게 간접화될 수 있다. DI 컨테이너의 자동 조립은 후보가 없거나 여러 개인 문제를 애플리케이션 시작 시 드러낼 수 있으므로 구성 검증이 필요하다. 전략 수가 많아지면 전략 구현뿐 아니라 선택 규칙도 복잡해지므로, 등록과 선택을 어디에서 관리할지 별도로 설계해야 한다.

## 기술면접 질문

### DI와 DIP의 차이는 무엇인가

DIP는 원칙이고 DI는 이를 구현하는 메커니즘입니다. DIP는 상위 정책과 하위 세부 구현이 모두 추상화에 의존하도록 요구하고, DI는 객체가 협력자를 외부에서 전달받게 해 그 의존 방향을 구성합니다. 다만 구체 클래스만 주입할 수도 있으므로 DI를 썼다는 사실만으로 DIP를 지켰다고 판단해서는 안 됩니다.

### 전략 패턴과 DI의 공통점과 차이는 무엇인가

전략 패턴과 DI는 공통 계약을 따르는 구현을 주입할 때 구현 교체를 쉽게 한다는 점에서 만날 수 있습니다. 전략 패턴은 같은 목적의 행동을 공통 계약으로 캡슐화하고, DI는 그 전략을 포함한 협력자를 외부에서 제공하는 메커니즘입니다. 따라서 전략을 생성자로 주입해 함께 쓸 수 있지만, 구체 객체 주입도 DI이므로 모든 주입 대상이 전략이거나 공통 계약을 갖는 것은 아닙니다.

### 생성자 주입이 테스트에 주는 이점은 무엇인가

생성자 주입은 객체가 동작하는 데 필요한 협력자를 생성 시점에 명시합니다. 테스트는 컨테이너나 실제 외부 시스템 없이 대역 구현을 생성자에 넣어 상위 로직만 검증할 수 있습니다. 다만 대역 기반 단위 테스트는 실제 빈 조립과 외부 연동을 보장하지 않으므로 통합 테스트로 보완해야 합니다.

### 전략 패턴에서 컨텍스트는 무엇인가

전략 패턴의 컨텍스트는 전략을 사용해 전체 작업 흐름을 수행하는 객체입니다. 이 예시에서는 `CheckoutService`가 체크아웃 흐름을 관리하고 실제 결제 행동을 `PaymentStrategy`에 위임합니다. 운영체제나 프론트엔드에서는 컨텍스트가 다른 의미이므로 답변할 때 전략 패턴이라는 도메인을 먼저 한정해야 합니다.

## 복습 체크리스트

- [ ] DIP라는 설계 원칙과 DI라는 구현 방법을 구분해 설명할 수 있다.
- [ ] 구체 구현을 주입하는 것만으로 DIP가 자동으로 성립하지 않는 이유를 설명할 수 있다.
- [ ] 전략 패턴이 교체 가능한 행동을 캡슐화하고 컨텍스트가 이를 사용하는 구조를 설명할 수 있다.
- [ ] 전략 패턴의 컨텍스트와 운영체제·프론트엔드의 컨텍스트 의미를 구분할 수 있다.
- [ ] 직접 생성 구조와 생성자 주입 구조에서 새 결제 수단 추가가 미치는 범위를 비교할 수 있다.
- [ ] 전략 선택 시점과 의존성 주입 시점을 별개의 설계 결정으로 판단할 수 있다.

## 참고 자료

- [DI와 DIP ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=118490)
- [전략패턴 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=118504)
- [Q. 전략패턴과 의존성주입의 차이는 무엇인가요? ★☆☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=120148)
- [Q. 컨텍스트란 무엇인가요? ★☆☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=120149)
- [Spring Framework Reference — Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring Framework Reference — Using `@Autowired`](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html)

---

이전: [팩토리 패턴과 이터레이터 패턴](/study/design-patterns/factory-and-iterator/) · [연재 목록](/study/design-patterns/) · 다음: [옵저버 패턴과 프록시 패턴](/study/design-patterns/observer-and-proxy/)
