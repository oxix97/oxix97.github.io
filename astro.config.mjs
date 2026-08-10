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
      title: "oxix97's Dev Log",
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
          navigation: 'header-start',
          authors: {
            oxix97: {
              name: 'oxix97',
              title: 'Backend Developer',
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
        PageTitle: './src/components/StarlightPageTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Study', items: [{ autogenerate: { directory: 'study' } }] },
        {
          label: 'Retrospectives',
          items: [{ autogenerate: { directory: 'retrospectives' } }],
        },
        { label: 'Projects', items: [{ autogenerate: { directory: 'projects' } }] },
        { label: 'About', link: '/about/' },
      ],
    }),
  ],
});
