export const SITE = {
  name: 'oxix97',
  title: 'oxix97의 개발 기록',
  description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
  url: 'https://oxix97.github.io',
  github: 'https://github.com/oxix97',
  resume: '/resume.pdf',
} as const;

export const NAV_ITEMS = [
  { label: '홈', href: '/' },
  { label: '학습', href: '/study/' },
  { label: '면접 질문', href: '/interview/' },
  { label: '프로젝트', href: '/projects/' },
  { label: '블로그', href: '/blog/' },
  { label: '소개', href: '/about/' },
] as const;

export function buildCanonicalUrl(pathname: string): string {
  return new URL(pathname, SITE.url).href;
}
