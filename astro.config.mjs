import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
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
      plugins: [starlightThemeRapide()],
      customCss: ['./src/styles/custom.css'],
      components: {
        PageTitle: './src/components/StarlightPageTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Blog', link: '/blog/' },
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
