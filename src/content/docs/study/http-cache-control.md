---
title: HTTP Cache-Control 정리
description: 브라우저와 공유 캐시의 재사용·재검증 규칙을 실무 관점에서 정리합니다.
contentType: study
publishedAt: 2026-08-04
tags: [HTTP, Cache, Web]
topic: Network
difficulty: intermediate
sidebar:
  order: 2
---

HTTP 캐시는 응답을 무조건 오래 저장하는 기능이 아닙니다. **누가, 얼마 동안,
어떤 조건에서 응답을 재사용할 수 있는지**를 서버와 클라이언트가 합의하는
규칙입니다.

## 자주 사용하는 지시어

| 지시어 | 의미 | 주의점 |
| --- | --- | --- |
| `max-age=N` | 응답을 N초 동안 신선한 것으로 간주 | 사용자별 응답에는 단독 사용 금지 |
| `public` | 공유 캐시도 저장 가능 | 인증 응답의 데이터 노출 검토 필요 |
| `private` | 브라우저 같은 개인 캐시만 저장 | CDN 캐시 이점은 사라짐 |
| `no-cache` | 사용 전 서버 재검증 필요 | 저장 금지를 의미하지 않음 |
| `no-store` | 응답을 저장하지 않음 | 민감 데이터에 사용 |

## 재검증 요청

신선도가 끝난 응답은 `ETag`와 `If-None-Match`, 또는 `Last-Modified`와
`If-Modified-Since`를 이용해 재검증할 수 있습니다. 내용이 바뀌지 않았다면
서버는 본문 없이 `304 Not Modified`로 응답합니다.

```http
Cache-Control: public, max-age=300
ETag: "article-v4"
```

## 운영에서 확인할 것

캐시 정책은 트래픽 그래프만 보고 성공을 판단하면 안 됩니다. 오래된 데이터가
허용되는 시간, 무효화 방식, 사용자별 응답 분리, 장애 시 캐시 동작을 함께
검증해야 합니다. 선택의 근거를 남기는 방법은
[기술적 의사결정을 기록하는 이유](/blog/recording-technical-decisions/)에서
이어집니다.
