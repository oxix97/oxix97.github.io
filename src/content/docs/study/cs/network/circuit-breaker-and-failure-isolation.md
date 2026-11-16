---
title: "23. 느린 의존성은 어떻게 격리하는가: 서킷 브레이커와 연쇄 장애"
description: 외부 서비스의 지연이 호출 서비스를 소진시키는 흐름을 보고 서킷 브레이커와 Resilience4j로 격리하는 방법을 정리합니다.
slug: study/network/circuit-breaker-and-failure-isolation
contentType: study
publishedAt: 2026-11-16
tags: [Network, Reliability, CircuitBreaker, Spring]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 23
---

회원 서비스가 느려져도 장바구니 요청은 계속 도착한다. 응답을 기다리는 스레드가 쌓이면 처음에는 정상이던 호출 서비스도 새 요청을 처리하지 못할 수 있다. 외부 의존성의 실패가 어디까지 번지는지 살펴보고, 서킷 브레이커로 호출 경계를 보호하는 방법을 정리한다.

## 핵심 요약

- 동기 호출이 오래 대기하면 호출 서비스의 스레드와 연결 풀이 먼저 소진되어 연쇄 장애로 이어질 수 있다.
- 서킷 브레이커는 실패율이나 느린 호출 비율을 관찰하고, 기준을 넘으면 외부 호출을 잠시 거절한다.
- `CLOSED`에서 실패가 누적되면 `OPEN`으로 바뀌고, 대기 시간이 지난 뒤 제한된 시험 호출을 허용하는 `HALF_OPEN`을 거친다.
- 서킷 브레이커는 동시 호출 수를 제한하거나 요청 시간을 정하지 않는다. 타임아웃과 Bulkhead를 별도로 설계한다.

## 느린 의존성이 장애를 전파하는 과정

주문 서비스가 장바구니 서비스를 호출하고, 장바구니 서비스가 다시 회원 서비스를 동기 방식으로 호출한다고 하자. 회원 서비스가 응답하지 않으면 장바구니 요청은 그 결과를 기다리고, 주문 요청은 장바구니의 응답을 기다린다. 이 대기가 반복되면 상위 서비스의 스레드나 연결 풀까지 점유될 수 있다.

다음 그림은 하나의 느린 호출이 동기 의존 경로를 따라 대기 상태를 넓히는 예시다.

<figure class="study-diagram">
  <img
    src="/images/study/network/reading/cascading-failure.svg"
    width="480"
    height="560"
    alt="주문 서비스가 장바구니를 기다리고 장바구니가 느린 회원 서비스를 기다리면서 두 서비스의 요청 스레드가 대기하는 동기 호출 경로"
    loading="lazy"
  />
  <figcaption>회원 서비스의 지연이 동기 호출을 따라 주문 서비스까지 전파되는 예시다.</figcaption>
</figure>

이 현상을 연쇄 장애(cascading failure)라고 한다. 지연은 서비스 사이를 따라 전파되고, 각 서비스가 요청을 처리할 자원을 잃으면서 장애 범위가 커진다. **느린 의존성을 오래 기다리게 두면 호출 서비스의 여유 자원도 함께 사라진다.**

서킷 브레이커는 호출 경계에서 최근 결과를 관찰한다. 실패나 느린 호출이 설정한 기준을 넘으면 다음 요청을 외부 서비스에 보내지 않고 빠르게 거절한다. 거절된 요청은 정해 둔 대체 응답으로 처리하거나 오류로 전달할 수 있다.

## 서킷 브레이커의 상태 전이

Resilience4j는 호출 결과를 슬라이딩 윈도우에 기록하고 실패율 또는 느린 호출 비율을 계산한다. 윈도우에 최소 호출 수가 쌓인 뒤 둘 중 하나가 설정한 기준 이상이면 `CLOSED`에서 `OPEN`으로 전환한다. 상태가 `OPEN`이면 원격 호출을 막고 `CallNotPermittedException`을 발생시킨다.

아래 전이도는 세 가지 일반 상태와 각 상태를 바꾸는 조건을 보여 준다.

<figure class="study-diagram">
  <img
    src="/images/study/network/reading/circuit-breaker-states.svg"
    width="480"
    height="520"
    alt="최소 호출 수 이후 실패율 또는 느린 호출 비율이 기준 이상이면 Closed에서 Open으로 전환하고, 대기 후 제한된 시험 호출에서 두 비율이 모두 기준 미만이면 Closed, 하나라도 기준 이상이면 Open으로 돌아가는 상태도"
    loading="lazy"
  />
  <figcaption>기준을 넘으면 차단하고, 대기 뒤 일부 호출로 복구 여부를 확인한다.</figcaption>
</figure>

기본 설정에서는 `OPEN`의 대기 시간이 지난 뒤 들어온 요청이 `HALF_OPEN` 상태의 시험 호출이 된다. 허용된 수만큼만 호출해 결과를 관찰하고, 실패율과 느린 호출 비율이 모두 기준 미만이면 `CLOSED`로 돌아간다. 둘 중 하나라도 기준 이상이면 `OPEN`으로 복귀한다. 자동으로 상태를 전환하는 옵션도 있지만 이 예제에서는 별도 감시 스레드가 없는 기본 동작을 사용한다.

슬라이딩 윈도우 크기는 동시 실행 수가 아니다. `CLOSED`에서는 윈도우 크기보다 더 많은 호출이 동시에 진행될 수 있다. **동시 실행량 제한에는 Bulkhead를 사용하고, 호출 대기 시간에는 HTTP 클라이언트 타임아웃을 설정한다.**

## Spring Boot와 Resilience4j로 격리하기

예제는 Spring Boot 4와 Resilience4j 2.4.0을 사용한다. Spring Boot의 동기 REST 클라이언트인 `RestClient`로 상품 정보를 조회하고, 읽기 화면에 표시할 수 없는 상태를 돌려준다. 다음 의존성은 Gradle Kotlin DSL 기준이다.

Spring 의존성 버전은 Spring Boot 플러그인이나 BOM으로 관리한다.

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-restclient")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-aspectj")
    implementation("io.github.resilience4j:resilience4j-spring-boot4:2.4.0")
}
```

회로 설정은 `application.yml`에서 인스턴스 이름 `catalog`으로 관리한다. 최근 10회 중 최소 5회의 결과를 모으고, 실패율이 50% 이상이면 5초 동안 호출을 차단한다. 숫자는 상태 전이를 보여 주기 위한 예시이며 운영 기준은 실제 지연과 복구 시간에 맞춰 정해야 한다.

```yaml
catalog:
  base-url: http://catalog-service

resilience4j:
  circuitbreaker:
    instances:
      catalog:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        slowCallDurationThreshold: 1s
        slowCallRateThreshold: 50
        waitDurationInOpenState: 5s
        permittedNumberOfCallsInHalfOpenState: 2
        ignoreExceptions:
          - org.springframework.web.client.HttpClientErrorException
```

Circuit Breaker는 요청이 얼마나 오래 걸리는지 제한하지 않는다. 아래 `RestClient` 설정은 연결 시도와 응답 본문 읽기의 대기 시간을 HTTP 클라이언트에서 각각 제한한다. 읽기 타임아웃은 데이터를 기다리는 대기 시간이지 전체 요청의 deadline이 아니다. 서버가 데이터를 조금씩 계속 보내면 전체 응답은 2초보다 오래 걸릴 수 있으므로, 전체 완료 시간에도 상한이 필요하면 별도의 deadline을 둔다.

```java
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration(proxyBeanMethods = false)
class CatalogClientConfiguration {
    @Bean
    RestClient catalogRestClient(
        RestClient.Builder builder,
        @Value("${catalog.base-url}") String baseUrl
    ) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(500));
        requestFactory.setReadTimeout(Duration.ofSeconds(2));

        return builder
            .baseUrl(baseUrl)
            .requestFactory(requestFactory)
            .build();
    }
}
```

호출 메서드에는 `@CircuitBreaker`를 붙이고 폴백 메서드를 지정한다. 이 예제는 네트워크 오류, 서버 오류, 열린 회로의 거절을 “현재 표시할 수 없음”으로 처리한다. 클라이언트 오류와 그 밖의 예외는 성공처럼 숨기지 않고 다시 던진다.

응답 본문을 변환하다 발생한 읽기 오류는 Spring의 `RestClientException`으로 감싸질 수 있다. 본문 읽기 타임아웃만 폴백하려고 원인 사슬에서 `SocketTimeoutException`을 확인하고, 타임아웃이 아닌 변환 오류와 4xx는 다시 던진다.

```java
import java.net.SocketTimeoutException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
class CatalogClient {
    private final RestClient restClient;

    CatalogClient(RestClient catalogRestClient) {
        this.restClient = catalogRestClient;
    }

    @CircuitBreaker(name = "catalog", fallbackMethod = "fallback")
    public CatalogView find(String id) {
        return restClient.get()
            .uri("/catalogs/{id}", id)
            .retrieve()
            .body(CatalogView.class);
    }

    private CatalogView fallback(String id, Exception cause) throws Exception {
        if (cause instanceof CallNotPermittedException
            || cause instanceof ResourceAccessException
            || cause instanceof HttpServerErrorException
            || hasCause(cause, SocketTimeoutException.class)) {
            return CatalogView.unavailable(id);
        }
        throw cause;
    }

    private static boolean hasCause(Throwable error, Class<? extends Throwable> type) {
        for (Throwable current = error; current != null; current = current.getCause()) {
            if (type.isInstance(current)) {
                return true;
            }
        }
        return false;
    }
}

record CatalogView(String id, String name, boolean available) {
    static CatalogView unavailable(String id) {
        return new CatalogView(id, null, false);
    }
}
```

이 호출 흐름에서 회로가 닫혀 있으면 요청이 상품 서비스까지 전달된다. 오류가 누적되어 회로가 열리면 원격 호출을 생략하고 폴백으로 돌아온다. 대기 시간이 지나면 제한된 시험 요청만 전달해 상품 서비스가 회복했는지 확인한다.

<figure class="study-diagram">
  <img
    src="/images/study/network/reading/circuit-breaker-request-flow.svg"
    width="480"
    height="640"
    alt="호출 서비스의 상품 조회 요청이 서킷 브레이커를 통과하며 닫힌 상태에서는 상품 서비스로 전달되고 열린 상태에서는 원격 호출 없이 제한된 대체 응답을 반환하는 흐름"
    loading="lazy"
  />
  <figcaption>회로가 열린 동안에는 원격 호출을 건너뛰고 읽기 화면용 대체 응답을 반환한다.</figcaption>
</figure>

Resilience4j의 Spring Boot 스타터는 AOP를 사용하므로 메서드가 Spring 빈 안에 있어야 한다. 또 폴백은 호출을 정상 처리한 것처럼 바꾸는 장치가 아니다. 상품 목록처럼 일부 기능을 제한해도 의미가 유지되는 읽기 흐름에만 대체 응답을 쓴다. 주문이나 결제 같은 쓰기 요청은 거짓 성공을 반환하지 말고 업무 결과와 재시도 가능성을 별도로 판단한다.

## 장점과 한계

서킷 브레이커는 반복 실패가 예상되는 의존성에 새 요청을 계속 보내지 않는다. 빠른 실패는 호출 서비스의 요청 스레드와 연결을 회수해 정상 경로가 함께 멈추는 위험을 낮춘다. 폴백을 안전하게 준비했다면 부가 조회가 중단되어도 핵심 화면을 유지할 수 있다.

함께 쓰는 패턴은 역할이 다르다.

| 기법 | 제한하거나 처리하는 대상 | 주의할 점 |
| --- | --- | --- |
| 타임아웃 | 한 번의 원격 호출이 기다리는 시간 | 호출 건마다 연결·응답 제한을 설정해야 한다. |
| 서킷 브레이커 | 실패가 이어지는 의존성으로 향하는 호출 | 임계치와 관찰 구간이 트래픽 특성에 맞아야 한다. |
| Bulkhead | 동시에 진행되는 호출 수나 자원 풀 | 제한을 너무 낮게 두면 정상 요청도 거절한다. |
| Rate Limiter | 일정 시간 동안 허용하는 요청 수 | 초과 요청을 기다릴지 거절할지 정책이 필요하다. |
| Retry | 일시적 실패 뒤 다시 시도하는 횟수와 간격 | 멱등성이 없거나 과부하가 이어지면 부하를 키운다. |

한 번의 일시적인 네트워크 오류에는 제한된 재시도와 백오프가 도움이 될 수 있다. 그러나 서비스가 계속 느린데 여러 번 재시도하면 부하와 대기가 늘어난다. 재시도 횟수와 간격을 제한하고, 중복 실행에 안전한 요청인지 확인한다. Circuit Breaker의 폴백과 재시도 역시 오류를 없애는 장치가 아니라 실패 영향을 다루는 정책이다.

## 기술면접 질문

### 서킷 브레이커는 연쇄 장애를 어떻게 줄이는가?

서킷 브레이커는 반복되는 외부 호출 실패나 지연에 따라 `CLOSED`에서 `OPEN`으로 바꾸고 추가 호출을 차단합니다. 대기 시간이 지나면 `HALF_OPEN`에서 제한된 시험 요청으로 복구 여부를 확인합니다. 이 과정은 호출 서비스의 대기 자원을 보호하지만 대체 응답의 의미는 애플리케이션이 정해야 합니다.

### 서킷 브레이커와 Bulkhead의 차이는 무엇인가?

서킷 브레이커는 실패율이나 느린 호출 비율이 기준을 넘으면 이후 호출을 거절합니다. Bulkhead는 동시에 실행할 수 있는 호출 수나 자원 풀을 제한해 의존성별 자원을 격리합니다. 따라서 실패가 누적될 때의 빠른 차단과 동시 처리량 제한은 서로 다른 목적으로 함께 적용할 수 있습니다.

### 서킷 브레이커의 임계치는 어떻게 정하는가?

서비스의 정상 실패율과 지연 분포, 허용 가능한 복구 시간을 먼저 측정합니다. 그 결과로 최소 관측 호출 수와 실패·느린 호출 기준, 차단 시간과 시험 호출 수를 정합니다. 운영 중에는 전이 횟수와 거절 요청, 사용자 오류율을 관찰해 기준을 조정합니다.

## 복습 체크리스트

- [ ] 느린 동기 의존성이 호출 서비스의 스레드나 연결을 소진시키는 과정을 설명할 수 있다.
- [ ] `CLOSED`, `OPEN`, `HALF_OPEN` 상태가 바뀌는 조건을 설명할 수 있다.
- [ ] Circuit Breaker가 HTTP 타임아웃이나 동시 호출 제한을 대신하지 않는 이유를 말할 수 있다.
- [ ] 타임아웃, Bulkhead, Rate Limiter, Retry가 제한하는 대상을 구분할 수 있다.
- [ ] 폴백이 안전한 조회와 거짓 성공을 허용하면 안 되는 쓰기 요청을 구분할 수 있다.

## 참고 자료

- [대규모 트래픽으로 인한 서버 과부화 해결방법 #2 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=129506)
- [AWS Prescriptive Guidance: Circuit breaker pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/circuit-breaker.html)
- [Resilience4j: Spring Boot 시작하기](https://resilience4j.readme.io/docs/getting-started-3)
- [Resilience4j: CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Resilience4j: Bulkhead](https://resilience4j.readme.io/docs/bulkhead)
- [AWS Prescriptive Guidance: Retry with backoff](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html)
- [Spring Boot: REST 클라이언트 호출](https://docs.spring.io/spring-boot/reference/io/rest-client.html)
- [Resilience4j 2.4.0 릴리스 노트](https://github.com/resilience4j/resilience4j/releases/tag/v2.4.0)

이전: [트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가](/study/network/traffic-overload-and-bottlenecks/) · [연재 목록](/study/network/) · 다음: [브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가](/study/network/browser-security-boundaries/)
