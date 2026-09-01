# oxix97.github.io

Astro, Starlight, Rapide, starlight-blog로 만든 백엔드 개발자 포트폴리오와 지식 기반입니다.

## 요구 사항

- Node.js 24
- Corepack
- pnpm 11.21.0

## 로컬 개발

```bash
corepack pnpm@11.21.0 install --frozen-lockfile
corepack pnpm@11.21.0 dev
```

## 검증

```bash
corepack pnpm@11.21.0 run verify
```

검증 파이프라인은 Astro 진단, Vitest 계약 테스트, 프로덕션 빌드, 중복된 Starlight
오버라이드 탐지, 프로덕션 산출물 검사를 실행합니다.

## 콘텐츠

- `src/content/docs/study/`: 지속적으로 관리하는 지식 문서
- `src/content/docs/interview/`: 면접 질문 모음
- `src/content/docs/projects/`: 프로젝트 배경과 기술적 결정
- `src/content/docs/blog/`: starlight-blog로 관리하는 시간순 게시글
- `src/content/docs/about.md`: 프로필과 업무 원칙

제목은 한글로 작성하고 URL slug는 안정적인 소문자 영어를 사용합니다. 제목이나
카테고리만 바뀌는 경우에는 기존 공개 slug를 변경하지 않습니다.

## 배포

Pull request에서는 `.github/workflows/ci.yml`이 실행됩니다. `main` 브랜치에
성공적으로 푸시하면 `.github/workflows/deploy.yml`의 검증된 GitHub Pages 배포가 실행됩니다.
