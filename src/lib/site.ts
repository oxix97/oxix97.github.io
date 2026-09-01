export const SITE = {
  name: 'oxix97',
  title: "oxix97's Dev Log",
  description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
  url: 'https://oxix97.github.io',
  github: 'https://github.com/oxix97',
  resume: '/resume.pdf',
} as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Study', href: '/study/' },
  { label: '면접 질문', href: '/interview/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
] as const;

export function buildCanonicalUrl(pathname: string): string {
  return new URL(pathname, SITE.url).href;
}
