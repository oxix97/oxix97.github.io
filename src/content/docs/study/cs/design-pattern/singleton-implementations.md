---
title: 싱글톤 구현 방식 비교
description: Java 싱글톤의 일곱 구현 방식을 초기화 시점, 스레드 안전성, 비용과 변경 영향으로 비교합니다.
slug: study/design-patterns/singleton-implementations
contentType: study
publishedAt: 2026-08-10
tags: [Design Pattern, Singleton, Java, Concurrency]
series: CS 지식의 정석 - 디자인 패턴
topic: Design Pattern
difficulty: intermediate
sidebar:
  order: 3
---

Java 싱글톤 구현은 초기화 시점과 동시성 비용에서 갈린다. 일곱 방식을 같은 기준표에 놓고 각각 무엇을 보장하는지 확인한다.

## 핵심 요약

Java 싱글톤 구현은 모두 같은 접근점을 제공하지만, 인스턴스를 만드는 시점과 동시 접근을 제어하는 방식이 다르다. 단순 지연 생성은 멀티스레드 환경에서 안전하지 않다. `synchronized` 접근자와 DCL은 안전성을 얻는 대신 각각 반복 잠금 경로와 구현 복잡도를 부담한다. 클래스 형태로 지연 초기화가 필요하면 Lazy Holder를 우선 검토할 수 있고, enum 형태가 API에 맞으면 enum이 간결하다. 어느 방식을 택해도 공유 상태 자체의 동시성은 별도로 설계해야 한다.

## 비교 기준

구현을 고를 때는 "인스턴스가 하나인가"만 확인해서는 부족하다. 다음 네 기준이 실제 실행 비용과 변경 범위를 가른다.

- **생성 시점**: 클래스 초기화 시 만들지, 첫 접근까지 미룰지 확인한다.
- **스레드 안전성**: 동시에 처음 접근해도 하나만 만들고 초기화 결과를 안전하게 공개하는지 확인한다.
- **지연 초기화**: 바깥 싱글톤 클래스가 초기화된 뒤에도 실제 인스턴스를 요청할 때까지 생성을 미룰 수 있는지 확인한다.
- **주요 비용**: 반복 잠금, `volatile` 읽기, 코드 복잡도, 이른 자원 할당 중 무엇을 감수하는지 확인한다.

같은 `getInstance()` 접근점을 유지하면 생성 정책 변경은 대체로 싱글톤 클래스 안에 머문다. 반대로 호출 코드가 생성자를 직접 부르거나 공유 상태에 기대면, 구현 방식을 바꿔도 여러 모듈과 테스트를 함께 수정해야 한다.

## 일곱 가지 구현 방식

| 방식 | 생성 시점 | 스레드 안전성 | 지연 초기화 | 주요 비용 |
| --- | --- | --- | --- | --- |
| 1. 단순 지연 생성 | 첫 `getInstance()` 호출 | 보장하지 않음 | 가능 | 동시 최초 호출에서 중복 생성 가능 |
| 2. `synchronized` 접근자 | 첫 `getInstance()` 호출 | 보장 | 가능 | 초기화 후에도 호출마다 모니터 획득 경로를 거침 |
| 3. 정적 `final` 즉시 생성 | 싱글톤 클래스 초기화 | 보장 | 클래스 초기화와 함께 생성 | 클래스의 다른 정적 메서드·비상수 필드만 써도 인스턴스가 생성될 수 있음 |
| 4. 정적 초기화 블록 | 싱글톤 클래스 초기화 | 보장 | 클래스 초기화와 함께 생성 | 이른 생성과 다단계 초기화 코드의 복잡도 |
| 5. Lazy Holder | `Holder` 클래스의 첫 사용 | 보장 | 가능 | Java 클래스 초기화 규칙에 의존하는 관용구를 이해해야 함 |
| 6. `volatile`을 사용한 DCL | 첫 `getInstance()` 호출 | 올바른 구현에서 보장 | 가능 | `volatile` 읽기와 잠금 코드의 복잡도 |
| 7. enum | enum 클래스 초기화 | 보장 | enum 클래스 초기화와 함께 생성 | enum 형태의 API와 상속 제한을 수용해야 함 |

1번은 `instance == null`이면 생성하는 가장 짧은 코드지만, null 확인과 할당이 하나의 원자적 동작이 아니다. 2번은 접근자 전체를 `synchronized`로 감싸 경쟁 조건을 없애지만, 이미 생성된 뒤에도 모든 호출이 동기화 경로를 지난다.

3번은 선언과 동시에 `static final` 필드에 할당하며 초기화가 단순할 때 적합하다. 4번은 같은 즉시 생성 계열이지만 정적 블록 안에서 여러 단계의 준비나 예외 변환을 할 수 있다. 두 방식 모두 인스턴스를 직접 요청하지 않아도 바깥 클래스의 다른 정적 메서드나 비상수 정적 필드를 먼저 사용하면 클래스 초기화와 함께 생성 비용을 낸다. enum도 enum 클래스가 초기화될 때 상수를 생성한다.

여기서 즉시 생성은 애플리케이션 시작과 동시에 무조건 생성된다는 뜻이 아니다. Java는 클래스를 처음 능동적으로 사용할 때 초기화할 수 있다. 표의 구분은 그 클래스의 초기화가 시작된 뒤에도 인스턴스 생성을 별도로 미룰 수 있는지를 기준으로 한다.

## Lazy Holder 구현

```java
public final class AppSettings {
    private AppSettings() {
    }

    private static final class Holder {
        private static final AppSettings INSTANCE = new AppSettings();
    }

    public static AppSettings getInstance() {
        return Holder.INSTANCE;
    }
}
```

`AppSettings`를 초기화해도 `Holder`를 바로 초기화하지 않는다. `getInstance()`가 `Holder.INSTANCE`를 처음 사용할 때 중첩 클래스가 초기화되고, JVM의 클래스 초기화 절차가 한 번의 생성을 동기화한다. 호출자는 별도 잠금 코드를 거치지 않으면서 지연 초기화를 얻는다.

## DCL에서 volatile이 필요한 이유

```java
private static volatile DclSingleton instance;

public static DclSingleton getInstance() {
    if (instance == null) {
        synchronized (DclSingleton.class) {
            if (instance == null) {
                instance = new DclSingleton();
            }
        }
    }
    return instance;
}
```

첫 번째 null 확인은 이미 생성된 뒤 잠금을 피하고, 잠금 안의 두 번째 확인은 기다리던 스레드가 다시 객체를 만들지 않게 한다. 그러나 두 번 확인하는 구조만으로는 잠금 밖에서 읽는 스레드에 초기화 결과가 안전하게 보인다고 보장할 수 없다.

Java Memory Model에서 `volatile` 필드에 대한 쓰기는 이후 같은 필드를 읽는 동작보다 happens-before이다. 생성자 실행 뒤 `instance`에 참조를 쓰고 다른 스레드가 그 값을 읽으면 초기화 중 기록한 상태도 함께 보인다. 이는 `volatile`이 CPU 캐시를 사용하지 않게 만든다는 뜻이 아니다. 해당 필드 접근 사이의 가시성과 순서를 언어 수준에서 보장한다는 뜻이다.

`volatile`은 객체 생성 전체를 원자적으로 만들지 않는다. DCL에서는 `synchronized` 블록이 단 하나의 생성을 담당하고, `volatile`이 잠금 밖 읽기의 안전한 공개를 담당한다.

## enum 구현

```java
public enum AppSettings {
    INSTANCE
}
```

호출자는 `AppSettings.INSTANCE`로 접근한다. 생성자를 직접 노출하거나 별도의 null 확인과 잠금 코드를 작성하지 않아도 되므로 구현이 가장 짧다. 다만 enum이 다른 클래스를 상속할 수 없고 API가 enum 상수 형태로 드러나므로, 기존 클래스 계층이나 `getInstance()` 기반 API를 유지해야 한다면 Lazy Holder가 더 자연스럽다.

## 어떤 방식을 선택할 것인가

- 인스턴스가 가볍고 애플리케이션에서 항상 사용한다면 정적 `final` 즉시 생성이 가장 단순하다.
- 초기화가 여러 단계이거나 실패를 애플리케이션 예외로 바꿔야 한다면 정적 초기화 블록이 그 절차를 한곳에 모은다.
- 클래스 형태를 유지하면서 무거운 생성을 최초 호출까지 미루려면 Lazy Holder를 우선 검토한다.
- enum 형태가 호출 API에 맞고 별도 상속이 필요 없다면 enum이 가장 간결하다.
- 초기화 뒤 호출 빈도가 낮고 단순한 지연 생성이 더 중요하다면 `synchronized` 접근자도 충분할 수 있다.
- DCL은 지연 초기화와 초기화 후 잠금 회피가 모두 필요하고, 팀이 메모리 모델까지 포함한 구현을 유지할 수 있을 때만 선택한다.
- 단순 지연 생성은 실행 환경이 실제로 단일 스레드로 제한될 때만 사용한다.

새 요구가 들어왔을 때의 변경 영향도 함께 보자. "사용하지 않으면 만들지 않는다"는 요구가 추가되면 3·4번은 생성 위치를 Lazy Holder나 다른 지연 방식으로 옮겨야 하지만 호출자가 `getInstance()`에만 의존했다면 변경은 클래스 내부에 머문다. 반면 "인스턴스에 변경 가능한 캐시를 추가한다"는 요구는 일곱 방식 모두에 별도 동기화나 불변 상태 설계를 요구하며, 이를 사용하는 모든 모듈과 테스트가 영향을 받을 수 있다.

## 장점과 한계

여러 구현 방식을 이해하면 초기화 비용, 호출 빈도, API 형태에 맞춰 생성 정책을 선택할 수 있고, 접근점을 유지한 채 정책 변경을 싱글톤 클래스 내부에 격리할 수 있다. 특히 Lazy Holder와 enum은 직접 작성할 동시성 코드가 적어 실수 가능성을 낮춘다.

어떤 방식도 싱글톤의 전역 접근과 공유 상태 문제를 없애지는 않는다. 단일 인스턴스 보장은 일반적인 접근 경로와 클래스 로더 범위의 이야기이며, 객체 내부의 변경 가능한 상태가 스레드 안전하다는 뜻도 아니다. 테스트 격리나 구현 교체가 중요하다면 정적 접근 대신 의존성을 주입하고 수명 관리를 조합 지점이나 컨테이너에 맡기는 선택도 비교해야 한다.

## 기술면접 질문

### 가장 단순한 지연 생성 방식은 왜 스레드 안전하지 않은가

단순 지연 생성은 null 확인과 객체 생성을 하나의 원자적 동작으로 묶지 않으므로 스레드 안전하지 않습니다. 두 스레드가 모두 null을 읽은 뒤 각각 생성하면 서로 다른 인스턴스를 반환할 수 있습니다. 단일 스레드가 보장되지 않는 애플리케이션에서는 Lazy Holder, enum 또는 올바르게 동기화한 구현을 선택합니다.

### synchronized 접근자는 어떤 비용이 있는가

`synchronized` 접근자는 첫 생성뿐 아니라 이후 모든 호출에서 같은 모니터를 획득합니다. 따라서 경쟁이 있으면 대기 비용이 생기고, 경쟁이 적어도 잠금 경로를 계속 거칩니다. 호출 빈도가 낮아 단순성이 더 중요하면 허용할 수 있지만, 빈번한 접근이라면 Lazy Holder나 enum을 먼저 검토합니다.

### DCL에 volatile이 필요한 이유는 무엇인가

DCL의 바깥 null 확인은 잠금 없이 `instance`를 읽으므로 그 읽기와 초기화 결과 사이에 안전한 공개 관계가 필요합니다. `volatile` 필드의 쓰기는 이후 같은 필드 읽기보다 happens-before이므로 생성자에서 기록한 상태가 참조와 함께 보이도록 합니다. `volatile`이 없으면 다른 스레드가 오래된 값이나 완전히 공개되지 않은 객체 상태를 관찰할 수 있어 두 번 확인만으로는 충분하지 않습니다.

### Lazy Holder와 enum은 어떻게 선택하는가

enum은 문법이 가장 간결하고 런타임이 인스턴스 생성을 관리하므로 enum 형태가 도메인 API에 맞을 때 우선 선택할 수 있습니다. 클래스 형태를 유지하거나 최초 호출까지 무거운 생성을 미루고 싶다면 Lazy Holder가 자연스럽습니다. 두 방식 모두 공유 상태의 동시성이나 전역 의존성을 해결하지 않으므로 객체 내부 상태와 테스트 격리는 별도로 설계해야 합니다.

## 복습 체크리스트

- [ ] 일곱 구현 방식의 생성 시점, 스레드 안전성, 주요 비용을 비교할 수 있다.
- [ ] 단순 지연 생성의 null 확인과 할당 사이에 경쟁 조건이 생기는 이유를 설명할 수 있다.
- [ ] Lazy Holder가 중첩 클래스 초기화를 이용해 지연 생성하는 과정을 설명할 수 있다.
- [ ] DCL에서 `synchronized`와 `volatile`이 각각 맡는 역할을 구분할 수 있다.
- [ ] 새 요구가 지연 생성인지 공유 상태 변경인지에 따라 영향 범위를 판단할 수 있다.

## 참고 자료

- [DEEP DIVE : 싱글톤 패턴을 구현하는 7가지 방법 #1 ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=132521)
- [DEEP DIVE : 싱글톤 패턴을 구현하는 7가지 방법 #2 ★★☆](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=132522)
- [Java Language Specification 12.4.1 — When Initialization Occurs](https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4.1)
- [Java Language Specification 12.4.2 — Detailed Initialization Procedure](https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4.2)
- [Java Language Specification 17.4.5 — Happens-before Order](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.5)

---

이전: [싱글톤 패턴의 원리와 장단점](/study/design-patterns/singleton-basics/) · [연재 목록](/study/design-patterns/) · 다음: [팩토리 패턴과 이터레이터 패턴](/study/design-patterns/factory-and-iterator/)
