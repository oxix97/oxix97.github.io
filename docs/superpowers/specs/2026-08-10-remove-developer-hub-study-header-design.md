# Developer Hub 제거 및 `개발 블로그` Study 링크 설계

## 목표

- `projects/developer-hub` 콘텐츠와 사이트 내 모든 참조를 제거한다.
- 홈 헤더의 `개발 블로그` 링크가 `/study/`를 열도록 변경한다.
- Blog의 실제 콘텐츠 경로(`/blog/`), RSS, 태그, 작성자 페이지는 유지한다.
- 사용자가 요청한 대로 테스트 명령은 실행하지 않는다.

## 현재 구조와 문제

`starlight-blog`가 `navigation: 'header-start'`일 때 헤더에 `개발 블로그` 링크를 자동으로 추가하고, 이 링크는 Blog prefix(`/blog/`)를 가리킨다. Blog 링크의 목적지만 바꾸려면 플러그인이 제공하는 자동 SiteTitle 렌더링 대신 프로젝트 SiteTitle 컴포넌트를 사용해야 한다.

Developer Hub는 다음에 노출된다.

- `src/content/docs/projects/developer-hub/index.mdx`
- 홈의 프로젝트 카드
- Projects 인덱스 링크
- Blog 본문과 검증 스크립트의 경로

## 선택한 설계

### 헤더와 Blog 탐색

`starlight-blog`의 `navigation`을 `none`으로 설정해 자동 Blog 헤더 링크와 SiteTitle override 충돌을 제거한다. 새 `src/components/SiteTitle.astro`는 Starlight 기본 SiteTitle을 렌더링하고, 동일한 시각적 위치에 `개발 블로그` 링크를 추가하되 href를 `/study/`로 지정한다.

Blog 탐색은 Starlight 사이드바에 `{ label: 'Blog', link: '/blog/' }`를 명시해 유지한다. Blog 페이지 안에서는 플러그인이 제공하는 Blog 전용 사이드바와 RSS 링크를 그대로 사용한다.

### Developer Hub 제거

Developer Hub 문서를 삭제하고 홈 카드·Projects 인덱스·Blog 본문의 링크와 설명을 제거하거나 문맥이 유지되는 일반 문장으로 바꾼다. `scripts/verify-build.mjs`에서는 Developer Hub 산출물 기대값을 제거하고 해당 경로가 생성되지 않았는지 확인한다. `/projects/stockwellness/`와 기타 공개 경로는 변경하지 않는다.

## 데이터 흐름

```text
헤더 SiteTitle
  └─ 개발 블로그 ──> /study/

Starlight 사이드바
  └─ Blog ──> /blog/

starlight-blog
  ├─ /blog/
  ├─ /blog/tags/*
  ├─ /blog/authors/*
  └─ /blog/rss.xml
```

## 오류 및 호환성

- `/blog/`와 Blog 세부 경로는 변경하지 않는다.
- Developer Hub 경로는 더 이상 생성하지 않으며 별도 redirect를 추가하지 않는다.
- Blog 플러그인의 `ThemeSelect` override는 Rapide와 충돌하지 않도록 유지한다.
- 헤더 링크와 사이드바 링크는 정적 HTML에 존재해야 하며 JavaScript 클릭 가로채기에 의존하지 않는다.

## 검증 범위

사용자 요청에 따라 테스트 명령은 실행하지 않는다. 대신 변경 후 정적 파일과 참조를 확인한다.

- `developer-hub` 참조가 콘텐츠·설정·검증 스크립트에 남지 않는지 확인
- 홈 HTML에 `/study/`를 가리키는 `개발 블로그` 링크가 존재하는지 확인
- Blog `/blog/` 경로와 RSS·태그·작성자 경로가 설정에서 유지되는지 확인
- 변경된 파일의 `git diff --check` 수행
