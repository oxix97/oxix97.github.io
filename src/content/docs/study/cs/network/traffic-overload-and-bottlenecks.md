---
title: "22. 트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가"
description: 지연·오류·자원 지표로 병목을 좁히고 분산, 제한, 차단, 캐시를 상황에 맞게 선택하는 순서를 정리합니다.
slug: study/network/traffic-overload-and-bottlenecks
contentType: study
publishedAt: 2026-09-29
tags: [Network, Performance, LoadBalancing, Reliability]
series: CS 지식의 정석 - 네트워크
topic: Network
difficulty: intermediate
sidebar:
  order: 22
---

요청이 급증해 응답 시간이 늘었다면 서버를 바로 늘리는 것이 정답일까? 먼저 어느 구간에서 대기가 쌓이는지 확인해야 한다. [네트워크 성능 지표](/study/network/network-performance-metrics/)와 [토폴로지의 병목](/study/network/topology-and-bottlenecks/)을 바탕으로, 측정 결과를 대응 방법에 연결해 본다.

## 핵심 요약

- 요청률, 지연 분포, 오류율, 처리량을 함께 보고 정상 시점과 비교한다.
- 병목이 CPU·메모리·DB·외부 의존성 중 어디에 있는지 확인한 뒤 용량 확장이나 요청 제한을 선택한다.
- 로드밸런싱과 자동 확장은 용량을 늘릴 수 있지만 공유 DB나 외부 API가 병목이면 효과가 제한된다.
- 필요한 데이터만 조회하고 CDN·캐시·압축으로 요청과 전송량을 줄이는 방법도 고려한다.
- 서킷 브레이커는 느린 의존성을 차단하고, 우아한 기능 축소는 과부하 때 핵심 기능을 보존한다.

## 느리다는 증상을 구간으로 나누기

예를 들어 평소보다 주문 조회 요청이 두 배 늘고 p95 지연과 5xx도 함께 증가했다고 하자. 평균 응답 시간 하나만으로는 네트워크 왕복 시간이 늘었는지, 애플리케이션 대기열이 찼는지, DB 쿼리가 밀리는지 알 수 없다.

`504 Gateway Timeout`은 게이트웨이나 프록시가 정해진 시간 안에 상위 서버의 응답을 받지 못했다는 뜻이다. 과부하가 원인일 수 있지만, 네트워크 문제나 상위 서버 지연도 같은 응답을 만들 수 있다. **504만 보고 과부하로 결론 내리지 말고 요청 경로의 지연과 오류를 함께 본다.**

```text
클라이언트 → DNS·연결 → 로드밸런서 → 애플리케이션 → DB·외부 API
                       각 구간의 지연·오류·대기량을 비교한다
```

먼저 요청률, 성공·오류 비율, p50·p95·p99 지연을 같은 시간축에 놓는다. 이어 CPU·메모리, 스레드나 연결 풀의 대기, DB 활성 연결과 느린 쿼리, 외부 API 타임아웃을 본다. 애플리케이션과 네트워크 구간을 측정하지 않았다면 임의로 원인을 단정하지 않는다. **처리량이 떨어진 지점과 대기가 시작된 지점을 찾아야 대응 방법을 고를 수 있다.**

모니터링 도구는 서버 자원과 애플리케이션 요청 지표를 모으고, 운영자가 정한 임계치에 경보를 연결한다. 예를 들어 CPU 사용률이 5분 동안 80%를 넘으면 알리도록 설정할 수 있지만, 이 값은 예시일 뿐 서비스의 평소 부하와 용량을 기준으로 정해야 한다. CPU 경보만으로 자동 확장하기보다 같은 시간대의 요청 지연·오류율과 DB·외부 의존성 지표를 함께 확인한다. CloudWatch나 Netdata는 지표를 관찰하는 도구이고, Slack은 경보를 전달하는 채널로 연동할 수 있다.

## 측정 결과에 맞춰 대응하기

| 관찰 | 검토할 대응 | 먼저 확인할 한계 |
| --- | --- | --- |
| 애플리케이션 인스턴스의 자원 포화 | 분산, 확장, 불필요한 작업 제거 | DB·외부 API의 용량도 충분한가 |
| 특정 요청이 비싸고 대기가 증가 | 요청 제한, 큐·동시 실행 수 제한 | 정상 사용자 요청을 얼마나 거절할 것인가 |
| 외부 의존성이 느리거나 실패 | 타임아웃, 제한된 재시도, 서킷 브레이커 | 재시도가 부하를 더 키우지 않는가 |
| 반복 조회와 큰 응답이 많음 | 캐시·CDN, 필요한 필드만 응답, 압축 | 최신성·무효화·CPU 비용은 어떤가 |

로드밸런서는 정상 대상에게 요청을 나누고 헬스 체크로 문제가 있는 대상을 제외할 수 있다. 그러나 모든 인스턴스가 하나의 DB에 몰리면 웹 서버만 늘려도 병목은 남는다. 자동 확장도 감지와 새 자원 준비에 시간이 걸린다. 급격한 과부하에는 한도를 정한 요청 거절과 부하 완화가 필요할 수 있다.

### 요청과 응답에서 처리할 일을 줄이기

서버를 늘리는 것과 별개로 요청 하나가 옮기고 계산하는 데이터도 줄일 수 있다. 강의 #3의 다섯 전략을 상품 목록 API에 적용하면 다음과 같다.

1. **필요한 데이터만 조회하고 응답한다.** 목록에 상품명과 가격만 필요하다면 `SELECT name, price FROM products`처럼 필요한 컬럼을 선택하고 DTO Projection으로 필요한 필드만 응답한다. DB에서 애플리케이션으로 전달하는 데이터와 응답 크기를 줄일 수 있다. `SELECT *`가 항상 DB 조회를 느리게 하는 것은 아니다. 행·열의 크기, 인덱스와 실행 계획을 함께 확인한다.
2. **정적 파일은 CDN으로 제공한다.** 상품 이미지, CSS, JavaScript처럼 여러 사용자에게 같은 파일을 주는 경우 엣지 캐시 적중 시 원본 서버까지 요청하지 않고 전달할 수 있다. 캐시 미스나 동적 콘텐츠는 원본으로 이어지므로 모든 요청이 사라지는 것은 아니다.
3. **캐시 위치마다 줄이는 비용을 구분한다.** 상품 이미지처럼 공개적으로 재사용할 수 있는 리소스는 예를 들어 `Cache-Control: public, max-age=3600`으로 브라우저나 공유 캐시가 최대 3,600초 동안 신선하게 다루도록 할 수 있다. 이 값은 콘텐츠 변경 주기에 맞춰 정한다. 개인별 응답을 공유할 수 없다면 `public`을 적용하지 않는다. Redis의 cache-aside 방식은 반복 DB 조회를 줄일 수 있지만 애플리케이션으로 들어오는 API 요청 자체를 없애지는 않는다. 캐시 만료와 무효화 정책도 함께 정한다.
4. **텍스트 콘텐츠를 압축한다.** 클라이언트가 허용한 `gzip`이나 Brotli로 HTML·CSS·JavaScript·JSON을 전송하면 응답 바이트를 줄일 수 있다. 압축과 해제에는 CPU가 들고, 이미 압축된 이미지나 영상은 추가 효과가 작을 수 있으므로 실제 크기와 CPU 사용량을 비교한다.
5. **우아한 기능 축소로 핵심을 남긴다.** 과부하 때 상품 추천이나 동영상 미리보기 같은 부가 기능을 줄이고 핵심 정보를 우선 제공할 수 있다. 가격이나 주문 상태처럼 최신성이 중요한 값은 오래된 캐시를 정상 데이터처럼 보여 주지 않는다. 무엇을 줄여도 되는지와 어떤 기능을 보존할지는 미리 정한다.

이 방법들은 서로 다른 비용을 줄인다. 브라우저 캐시와 CDN은 원본 요청을, Redis 캐시는 반복 DB 작업을, 압축은 전송 바이트를 줄인다. 적용 뒤에는 원본 요청 수, DB 조회량, 응답 크기와 CPU 사용량을 다시 비교한다.

서킷 브레이커는 느린 의존성 호출을 일시적으로 막고 제한된 시험 호출로 회복을 확인한다. 모든 오류를 무조건 숨기는 장치는 아니다. **서킷 브레이커는 의존성 호출 경계를 보호하고, 우아한 기능 축소는 서비스의 부가 작업을 줄인다.** 상태와 설정은 [23번 글](/study/network/circuit-breaker-and-failure-isolation/)에서 이어서 볼 수 있다.

장애 때 처음 대응 절차를 만들면 복구가 늦어진다. 감지 즉시 영향받는 서비스와 사용자 범위를 확인하고, 지표·로그·추적으로 원인을 좁힌다. 담당자에게 상황을 공유한 뒤 부하 제한, 부가 기능 중단, 롤백, 용량 확장처럼 원인에 맞는 완화 조치를 선택한다. 복구 후 사후 분석에서 발생 시각, 영향, 원인, 대응 시간과 후속 조치를 기록해 재발 방지로 연결한다.

## 장점과 한계

측정 → 병목 위치 확인 → 대응 → 재측정의 순서를 지키면 장비 증설만 반복하는 일을 줄일 수 있다. 요청 제한과 차단은 과부하가 다른 구성 요소로 전파되는 것을 막는 데 도움이 된다.

다만 하나의 지표나 기법으로 모든 장애를 설명할 수 없다. 과부하 중에는 관측 시스템도 데이터를 늦게 보낼 수 있고, 한 구간을 개선하면 다음 병목이 드러날 수 있다. 변경 뒤 오류율과 사용자 경험을 다시 확인해야 한다.

## 기술면접 질문

### 트래픽이 늘고 응답이 느려지면 무엇부터 확인하는가?

요청률, 지연 분포, 오류율, 처리량을 정상 시점과 비교합니다. 이어 로드밸런서, 애플리케이션, DB와 외부 의존성의 대기 및 자원 지표를 봅니다. 병목이 시작된 구간을 찾은 뒤 대응 방법을 고릅니다.

### 서버를 늘려도 성능이 나아지지 않는 이유는 무엇인가?

여러 서버가 공유하는 DB, 연결 풀 또는 외부 API가 병목일 수 있습니다. 웹 서버 확장은 웹 서버 구간의 용량만 늘립니다. 전체 요청 경로의 제한 지점을 확인해야 개선 방법을 고를 수 있습니다.

### 서킷 브레이커와 재시도는 어떻게 다른가?

재시도는 실패한 호출을 다시 시도합니다. 서킷 브레이커는 실패가 지속될 때 추가 호출을 잠시 차단합니다. 무제한 재시도는 과부하를 키울 수 있으므로 타임아웃, 횟수, 백오프와 함께 설계해야 합니다.

## 복습 체크리스트

- [ ] 느린 요청을 구간별 지연과 오류 지표로 좁히는 순서를 설명할 수 있다.
- [ ] 확장, 요청 제한, 서킷 브레이커, 캐시가 각각 어떤 병목에 맞는지 판단할 수 있다.
- [ ] 필요한 데이터 조회, CDN·HTTP·서버 캐시, 압축과 우아한 기능 축소가 줄이는 비용을 구분할 수 있다.
- [ ] 서버 확장만으로 공유 DB 병목을 해결할 수 없는 이유를 설명할 수 있다.
- [ ] 대응 후 어떤 지표로 효과와 부작용을 재확인할지 말할 수 있다.

## 참고 자료

- [대규모 트래픽으로 인한 서버 과부화 해결방법 #1 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=129505)
- [대규모 트래픽으로 인한 서버 과부화 해결방법 #2 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=129506)
- [대규모 트래픽으로 인한 서버 과부화 해결방법 #3 ★★★](https://www.inflearn.com/courses/lecture?courseId=328823&unitId=141066)
- [RFC 9110: 504 Gateway Timeout](https://www.rfc-editor.org/rfc/rfc9110#name-504-gateway-timeout)
- [RFC 9110: Content Codings](https://www.rfc-editor.org/rfc/rfc9110#section-8.4)
- [RFC 7932: Brotli Compressed Data Format](https://www.rfc-editor.org/rfc/rfc7932)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [Amazon CloudFront: How CloudFront Delivers Content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html)
- [Redis: Cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)
- [Amazon CloudWatch 사용 설명서](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [AWS Well-Architected: Throttle requests](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_throttle_requests.html)
- [AWS Well-Architected: Implement graceful degradation](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_graceful_degradation.html)

이전: [REST API는 리소스를 어떻게 표현하고 연결하는가](/study/network/rest-api/) · [연재 목록](/study/network/) · 다음: [느린 의존성은 어떻게 격리하는가: 서킷 브레이커와 연쇄 장애](/study/network/circuit-breaker-and-failure-isolation/)
