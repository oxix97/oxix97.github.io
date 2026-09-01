---
title: Spring 면접 질문 100선
description: 신입·주니어 Spring 백엔드 면접에서 자주 다루는 100개 질문과 답변을 주제별로 정리합니다.
slug: interview/spring
contentType: page
sidebar:
  order: 1
---

아래 답변은 **신입·주니어 Spring 백엔드 기술면접에서 1~2분 안에 설명할 수 있는 수준**으로 작성했습니다. 기능 이름만 외우기보다 `필요한 이유 → 동작 원리 → 주의할 점 → 실무 연결` 구조를 익히는 편이 좋습니다.

## 질문 분류

1. [Spring Core — 1~20번](./spring-core/)
2. [Dependency Injection / Proxy / AOP — 21~30번](./dependency-injection-proxy-aop/)
3. [Spring MVC / HTTP — 31~50번](./spring-mvc-http/)
4. [Validation / Exception — 51~60번](./validation-exception/)
5. [Transaction — 61~75번](./transaction/)
6. [JPA / Hibernate — 76~95번](./jpa-hibernate/)
7. [Spring Boot / Test / 운영 — 96~100번](./spring-boot-test-operations/)

## Spring 면접에서 특히 중요한 30개

100개를 전부 같은 깊이로 공부하기보다는 신입·주니어 면접에서 자주 연결되는 개념부터 준비하는 편이 효율적입니다.

| 등급 | 영역 | 질문 |
| --- | --- | --- |
| S | Core | IoC / DI |
| S | Core | Bean / Container |
| S | Core | 생성자 주입 |
| S | Core | Singleton Bean |
| S | Core | Bean Thread Safety |
| S | AOP | Proxy |
| S | AOP | `@Transactional` 동작 |
| S | AOP | Self Invocation |
| S | MVC | Spring MVC 요청 처리 |
| S | MVC | DispatcherServlet |
| S | MVC | RequestBody / MessageConverter |
| S | MVC | DTO 사용 이유 |
| S | Transaction | Transaction 범위 |
| S | Transaction | REQUIRED |
| S | Transaction | REQUIRES_NEW |
| S | Transaction | Isolation |
| S | JPA | Persistence Context |
| S | JPA | 1차 Cache |
| S | JPA | Dirty Checking |
| S | JPA | Flush / Commit |
| S | JPA | LAZY / EAGER |
| S | JPA | N+1 |
| S | JPA | Fetch Join |
| S | JPA | 연관관계 주인 |
| A | JPA | Cascade |
| A | JPA | QueryDSL |
| A | Boot | Auto Configuration |
| A | Test | SpringBootTest / WebMvcTest / DataJpaTest |
| A | 운영 | Connection Pool |
| A | 운영 | 서버 Latency 분석 |

## 실제 면접에서는 개념을 연결해야 합니다

예를 들어 `@Transactional` 질문은 다음 흐름으로 연결할 수 있습니다.

```text
@Transactional
    ↓
Spring AOP
    ↓
Proxy
    ↓
TransactionManager
    ↓
Connection
    ↓
Persistence Context
    ↓
Dirty Checking
    ↓
Flush
    ↓
Commit / Rollback
    ↓
Self Invocation
```

N+1 질문도 연관관계와 조회 전략까지 함께 설명할 수 있어야 합니다.

```text
Persistence Context
    ↓
Entity
    ↓
연관관계
    ↓
LAZY Loading
    ↓
Proxy
    ↓
N+1
    ↓
Fetch Join
    ↓
Collection Fetch Join
    ↓
Pagination 문제
    ↓
Batch Fetch
```

이런 연결 구조로 학습하면 꼬리질문이 이어져도 답변의 흐름을 유지하기 쉽습니다. 특히 주니어 백엔드 면접에서는 기능 이름보다 해당 기능이 필요한 이유, 내부 동작, 잘못 사용했을 때의 문제까지 설명하는 능력이 중요합니다.

## 참고 자료

- [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/reference/)
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/reference/)
- [Jakarta Persistence Specification](https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1.pdf)
