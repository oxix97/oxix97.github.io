import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightBlog from 'starlight-blog';
import starlightThemeRapide from 'starlight-theme-rapide';

export default defineConfig({
  site: 'https://oxix97.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'oxix97의 개발 기록',
      description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
      disable404Route: true,
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      plugins: [
        starlightThemeRapide(),
        starlightBlog({
          title: '개발 블로그',
          prefix: 'blog',
          navigation: 'none',
          authors: {
            oxix97: {
              name: 'oxix97',
              title: '백엔드 개발자',
              url: 'https://github.com/oxix97',
            },
          },
          metrics: {
            readingTime: true,
            words: 'rounded',
          },
          postCount: 5,
          recentPostCount: 5,
          rss: true,
          structuredData: true,
        }),
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' },
      ],
      sidebar: [
        { label: '홈', link: '/' },
        {
          label: '학습',
          items: [
            { slug: 'study' },
            {
              label: 'CS',
              items: [{ autogenerate: { directory: 'study/cs' } }],
            },
            {
              label: 'Spring',
              items: [{ autogenerate: { directory: 'study/spring' } }],
            },
          ],
        },
        {
          label: '면접 질문',
          items: [
            { slug: 'interview' },
            {
              label: 'Java',
              items: [{ autogenerate: { directory: 'interview/java' } }],
            },
            {
              label: 'Spring',
              items: [{ autogenerate: { directory: 'interview/spring' } }],
            },
            {
              label: 'DB',
              items: [{ autogenerate: { directory: 'interview/db' } }],
            },
          ],
        },
        { label: '프로젝트', items: [{ autogenerate: { directory: 'projects' } }] },
        { label: '블로그', link: '/blog/' },
        { label: '소개', link: '/about/' },
      ],
    }),
  ],
});
