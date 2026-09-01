---
title: Java 면접 질문 100선
description: 신입·주니어 Java 백엔드 면접에서 자주 다루는 100개 질문과 답변을 주제별로 정리합니다.
slug: interview/java
contentType: page
sidebar:
  order: 1
---

아래 답변은 **신입·주니어 Java 백엔드 기술면접에서 그대로 말할 수 있는 수준**으로 작성했습니다. 문장 자체를 암기하기보다는 `정의 → 동작 원리 → 특징/트레이드오프 → 실무 연결` 구조를 익히는 편이 좋습니다.

## 질문 분류

1. [Java 기본 / 객체지향 — 1~20번](./basics-and-oop/)
2. [Object / String / 불변 객체 — 21~30번](./object-string-immutability/)
3. [Primitive / Wrapper / Generic — 31~40번](./primitive-wrapper-generics/)
4. [Collection — 41~60번](./collections/)
5. [Exception — 61~70번](./exceptions/)
6. [JVM / Memory / GC — 71~85번](./jvm-memory-gc/)
7. [Thread / 동시성 — 86~100번](./threads-and-concurrency/)

## Java 100문제 학습 우선순위

100개를 전부 동일하게 공부하기보다는 면접 가능성을 기준으로 나누는 것이 효율적입니다.

### S급 — 반드시 설명할 수 있어야 함

신입·주니어 기준으로 다음은 특히 중요합니다.

* JVM / JDK / JRE
* 객체지향 4대 특징
* 다형성
* 인터페이스 vs 추상 클래스
* `==` vs `equals`
* `equals` / `hashCode`
* String 불변성
* Generic
* ArrayList
* HashMap 내부 구조
* HashMap Collision
* HashMap vs ConcurrentHashMap
* Checked / Unchecked Exception
* JVM Memory
* Heap / Stack
* GC / Reachability
* Process / Thread
* synchronized
* volatile
* Race Condition
* Deadlock
* AtomicInteger
* Thread Pool

### A급 — S급에서 높은 확률로 이어지는 꼬리질문

* String Pool
* Boxing / Unboxing
* Integer Cache
* PECS
* TreeMap
* Comparator
* Immutable 객체
* try-with-resources
* Metaspace
* ClassLoader
* Stop-The-World
* CompletableFuture
* Parallel Stream

### 실제 준비 방법

예를 들어 **HashMap** 하나를 공부한다면 질문 하나만 외우지 말고 다음 연결 구조까지 답할 수 있어야 합니다.

```text
HashMap
   ↓
hashCode()
   ↓
bucket
   ↓
Hash Collision
   ↓
equals()
   ↓
Linked List / Red-Black Tree
   ↓
equals-hashCode contract
   ↓
mutable key 문제
   ↓
ConcurrentHashMap
```

이런 식으로 준비하면 면접관이 꼬리질문을 4~5번 이어가도 답변 흐름을 유지하기 쉽습니다.

특히 주니어 백엔드 면접에서는 **JVM 이론 자체를 깊게 외우는 것보다 Java 개념이 실제 Spring 서버에서 어떤 문제로 연결되는지 설명하는 능력**이 중요합니다. 예를 들어 `synchronized` 질문이 나오면 단순히 Monitor 설명에서 끝내지 말고 **Spring Singleton Bean → 공유 상태 → 단일 JVM → 다중 인스턴스에서는 한계 → DB/분산락 필요**까지 연결할 수 있으면 상당히 좋은 답변이 됩니다.
