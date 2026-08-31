---
title: Spring IoC 컨테이너와 의존성 주입
description: Spring 컨테이너가 Bean을 등록하고 의존성을 조립하는 과정과 생성자 주입을 선택하는 이유를 정리합니다.
slug: study/spring/ioc-container-and-dependency-injection
contentType: study
publishedAt: 2026-09-01
tags: [Spring, IoC, Dependency Injection, Bean]
series: Spring 핵심 원리
topic: Spring
difficulty: intermediate
sidebar:
  order: 1
---

IoC와 DI는 대개 한 묶음으로 설명된다. 그러다 보니 "제어권을 넘긴다"와 "의존성을 주입한다"를 비슷한 말처럼 외우기 쉽다. 둘을 구분하려면 Spring이 객체를 대신 만든다는 설명에서 한 단계 더 들어가야 한다. 어떤 제어권이 이동하고, 컨테이너가 무엇을 보고 객체를 조립하는지가 기준이다.

## 핵심 요약

- IoC는 객체 생성과 조립의 제어권을 애플리케이션 코드 밖으로 옮기는 원칙이다.
- DI는 객체가 협력자를 직접 찾거나 만들지 않고 외부에서 전달받는 방식이다.
- Spring의 `ApplicationContext`는 설정 메타데이터를 읽어 Bean을 생성하고 의존성을 연결한다.
- 생성자 주입은 필수 의존성을 객체 생성 시점에 드러내며 테스트에서 대역을 넣기 쉽다.

## 직접 생성하면 무엇이 묶이는가

서비스가 저장소 구현을 직접 생성하면 객체를 사용하는 책임과 조립하는 책임이 한곳에 모인다.

```java
final class OrderService {
    private final OrderRepository orderRepository =
        new JpaOrderRepository();

    Order findOrder(long orderId) {
        return orderRepository.findById(orderId);
    }
}
```

`OrderService`는 주문 조회 흐름뿐 아니라 `JpaOrderRepository`를 만드는 방법까지 알아야 한다. 저장소 생성자에 설정값이 추가되면 서비스도 함께 바뀐다. 테스트용 구현으로 교체하기도 어렵다.

생성과 사용을 분리하면 서비스는 필요한 협력자만 선언한다.

```java
final class OrderService {
    private final OrderRepository orderRepository;

    OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    Order findOrder(long orderId) {
        return orderRepository.findById(orderId);
    }
}
```

이 코드는 아직 Spring에 의존하지 않는다. 외부 코드가 `OrderRepository`를 생성자에 전달하면 DI가 성립한다. Spring은 이 조립 지점을 컨테이너로 제공한다.

**DI는 Spring 전용 기능이 아니다. Spring은 DI를 자동화하는 컨테이너를 제공한다.**

## IoC와 DI는 어떻게 다른가

IoC(Inversion of Control)는 제어의 역전을 가리킨다. 객체가 자신의 협력자를 직접 생성하거나 찾는 대신, 외부 컨테이너가 객체를 만들고 연결한다. 애플리케이션 코드는 완성된 객체를 받아 비즈니스 동작에 집중한다.

DI(Dependency Injection)는 IoC를 구현하는 방법 중 하나다. 객체는 필요한 협력자를 생성자 인자, 팩토리 메서드 인자 또는 프로퍼티로 선언한다. 컨테이너는 Bean을 생성할 때 알맞은 의존성을 전달한다.

| 구분 | IoC | DI |
| --- | --- | --- |
| 의미 | 객체 생성과 조립의 제어권을 외부로 옮기는 원칙 | 필요한 협력자를 외부에서 전달하는 방식 |
| 질문 | 누가 객체의 생성과 연결을 결정하는가 | 객체가 의존성을 어떻게 받는가 |
| Spring에서의 예 | IoC 컨테이너가 Bean을 관리 | 생성자나 `@Bean` 메서드 인자로 Bean을 주입 |

IoC가 더 넓은 개념이고 DI는 그 원칙을 적용하는 구체적인 방식이다. DI를 적용했다고 해서 의존관계 역전 원칙(DIP)까지 자동으로 지켜지는 것은 아니다. 구체 클래스만 주입한다면 생성 책임은 분리되지만 상위 코드가 여전히 세부 구현에 의존할 수 있다.

## Spring 컨테이너는 Bean을 어떻게 조립하는가

Spring에서 Bean은 IoC 컨테이너가 관리하는 객체다. 컨테이너는 Bean을 생성하고 서로 연결한다. `ApplicationContext`는 `BeanFactory`를 확장한 인터페이스이며, 일반적인 애플리케이션에서 Spring 컨테이너를 나타낸다.

컨테이너는 먼저 설정 메타데이터에서 Bean 정의를 읽는다. 컴포넌트 클래스나 `@Configuration`과 `@Bean`을 사용한 Java 설정, XML이 이 메타데이터를 제공한다. 컨테이너는 등록된 정의에 따라 Bean을 만들고 필요한 의존성을 연결한다.

```text
설정 메타데이터
    ↓
Bean 정의 등록
    ↓
Bean 생성
    ↓
의존성 탐색과 주입
    ↓
초기화된 Bean 제공
```

**컨테이너는 클래스 이름만 보고 임의로 객체를 만드는 것이 아니다. 등록된 Bean 정의와 주입 지점을 기준으로 조립한다.**

### 컴포넌트 스캔으로 등록하기

`@Component`가 붙은 클래스는 컴포넌트 스캔의 후보가 된다. `@Service`, `@Repository`, `@Controller`는 `@Component`를 계층별로 구체화한 스테레오타입이다. 이 중 `@Repository`는 영속성 계층을 표시하며 예외 변환의 대상으로도 쓰인다.

```java
@Repository
final class JpaOrderRepository implements OrderRepository {
    // 저장 로직
}

@Service
final class OrderService {
    private final OrderRepository orderRepository;

    OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```

`OrderService`에 생성자가 하나뿐이면 `@Autowired`를 생략할 수 있다. Spring은 생성자 매개변수 타입과 맞는 Bean을 찾아 주입한다.

### Java 설정으로 등록하기

외부 라이브러리 클래스처럼 소스에 `@Component`를 붙이기 어렵거나 생성 과정을 직접 제어해야 한다면 `@Bean`을 사용할 수 있다.

```java
@Configuration
class OrderConfig {
    @Bean
    OrderRepository orderRepository(DataSource dataSource) {
        return new JdbcOrderRepository(dataSource);
    }

    @Bean
    OrderService orderService(OrderRepository orderRepository) {
        return new OrderService(orderRepository);
    }
}
```

`@Bean` 메서드의 반환 객체는 컨테이너가 관리한다. 메서드 매개변수는 해당 Bean을 만들 때 필요한 의존성을 나타낸다.

## 같은 타입의 Bean이 여러 개라면

타입 기준 주입은 후보가 하나일 때 단순하다. 같은 인터페이스를 구현한 Bean이 둘 이상이면 컨테이너는 어느 객체를 넣어야 할지 결정할 정보가 더 필요하다.

```java
@Component
@Primary
final class JpaOrderRepository implements OrderRepository {
}

@Component
final class InMemoryOrderRepository implements OrderRepository {
}
```

`@Primary`는 여러 후보 중 기본으로 선택할 Bean을 표시한다. 특정 주입 지점에서 후보를 좁히려면 `@Qualifier`를 사용할 수 있다. 이 선택 규칙을 숨긴 채 필드 이름에 기대면 Bean 이름 변경이 동작에 영향을 줄 수 있으므로 의도를 명시하는 편이 낫다.

**주입 후보가 여러 개라면 기본 구현인지, 용도별 구현인지부터 정하고 선택 규칙을 코드에 드러낸다.**

## Bean 범위와 객체 상태

Spring Bean의 기본 범위는 `singleton`이다. 이 singleton은 애플리케이션 전체에 객체가 절대 하나라는 뜻이 아니다. 하나의 Bean 정의에 대해 Spring 컨테이너마다 하나의 인스턴스를 관리한다.

`prototype` 범위는 컨테이너에 Bean을 요청할 때마다 새 인스턴스를 만든다. 웹 환경에서는 요청, 세션, 애플리케이션 범위도 사용할 수 있다. 다만 singleton Bean에 변경 가능한 요청별 상태를 필드로 보관하면 여러 요청이 같은 객체를 공유하므로 동시성 문제가 생길 수 있다.

| 범위 | 인스턴스 기준 | 주의할 점 |
| --- | --- | --- |
| `singleton` | 컨테이너와 Bean 정의마다 하나 | 요청별 변경 상태를 필드에 두지 않는다 |
| `prototype` | 조회하거나 주입을 해결할 때 새로 생성 | 컨테이너가 소멸 콜백까지 모두 관리하지 않는다 |
| `request` | HTTP 요청마다 하나 | 웹 환경의 `ApplicationContext`에서 사용한다 |
| `session` | HTTP 세션마다 하나 | 세션 수명과 메모리 사용을 함께 본다 |

## 장점과 한계

IoC 컨테이너를 사용하면 객체 생성과 연결 규칙을 한곳에서 관리할 수 있다. 서비스는 협력자의 생성 방법을 몰라도 되고, 테스트는 생성자에 대역을 전달해 컨테이너 없이 실행할 수 있다. Bean의 범위와 생명주기도 설정으로 관리할 수 있다.

자동 조립이 언제나 코드를 단순하게 만드는 것은 아니다. 컴포넌트 스캔 범위가 넓고 같은 타입의 구현이 많으면 실제 주입 대상을 찾는 데 시간이 든다. 필드 주입은 객체가 요구하는 의존성을 생성자에서 감춘다. 컨테이너 없이 객체를 만들기도 불편하다. 작은 객체까지 전부 Bean으로 등록하면 조립 정보와 간접 참조만 늘어날 수 있다.

Spring이 제공하는 편의와 객체 설계는 따로 판단해야 한다. 교체하거나 생명주기를 관리할 필요가 있는 협력자는 Bean으로 두고, 단순한 값 객체는 일반 생성으로 충분한 경우가 많다.

## 기술면접 질문

### IoC와 DI의 차이는 무엇인가요?

IoC는 객체의 생성과 조립에 대한 제어권을 애플리케이션 코드 밖으로 옮기는 원칙입니다. DI는 객체가 필요한 협력자를 직접 생성하지 않고 생성자나 팩토리 메서드 등을 통해 외부에서 받는 방식입니다. Spring에서는 IoC 컨테이너가 Bean을 생성하면서 등록된 의존성을 주입합니다.

### 생성자 주입을 선호하는 이유는 무엇인가요?

생성자 주입은 객체가 동작하는 데 필요한 의존성을 생성 시점에 명시합니다. 필드를 `final`로 유지할 수 있고, 테스트에서도 Spring 컨테이너 없이 대역을 전달할 수 있습니다. 다만 생성자 매개변수가 지나치게 많다면 주입 방식을 바꾸기보다 객체가 너무 많은 책임을 맡고 있는지 먼저 확인해야 합니다.

### 같은 타입의 Bean이 여러 개면 Spring은 어떻게 주입하나요?

타입에 맞는 후보가 여러 개이면 추가 선택 기준이 필요합니다. 기본 후보는 `@Primary`로 지정할 수 있고, 특정 용도의 Bean은 `@Qualifier`로 좁힐 수 있습니다. 후보 선택이 모호한 상태로 남으면 컨테이너가 의존성을 결정하지 못하므로 각 구현의 역할을 구분해 명시해야 합니다.

## 복습 체크리스트

- [ ] IoC라는 원칙과 DI라는 구현 방식을 구분해 설명할 수 있다.
- [ ] Spring Container, `ApplicationContext`, Bean의 관계를 설명할 수 있다.
- [ ] 컴포넌트 스캔과 `@Bean` 등록을 언제 선택할지 설명할 수 있다.
- [ ] 생성자 주입이 객체 설계와 테스트에 주는 이점을 설명할 수 있다.
- [ ] 같은 타입의 Bean이 여러 개일 때 `@Primary`와 `@Qualifier`로 후보를 구분할 수 있다.
- [ ] Spring singleton이 GoF singleton과 범위에서 어떻게 다른지 설명할 수 있다.

## 참고 자료

- [Spring Framework Reference: Introduction to the Spring IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)
- [Spring Framework Reference: Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
- [Spring Framework Reference: Classpath Scanning and Managed Components](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)
- [Spring Framework Reference: Using `@Autowired`](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html)
- [Spring Framework Reference: Using the `@Bean` Annotation](https://docs.spring.io/spring-framework/reference/core/beans/java/bean-annotation.html)
- [Spring Framework Reference: Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)

---

[연재 목록](/study/spring/)
