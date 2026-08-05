import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import starlightThemeObsidian from 'starlight-theme-obsidian';

export default defineConfig({
  site: 'https://oxix97.github.io',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    resolve: {
      // The graph plugin ships Node-oriented micromatch code in its browser bundle.
      // This narrow alias provides the only API the client graph uses without Node globals.
      alias: {
        micromatch: fileURLToPath(new URL('./src/lib/browser-micromatch.ts', import.meta.url)),
      },
    },
  },
  integrations: [
    starlight({
      title: "oxix97's Dev Log",
      description: '문제 해결 과정과 기술적 판단을 기록하는 백엔드 개발자 포트폴리오',
      disable404Route: true,
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      plugins: [starlightThemeObsidian()],
      customCss: ['./src/styles/custom.css'],
      components: {
        PageTitle: './src/components/StarlightPageTitle.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oxix97' },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Blog', autogenerate: { directory: 'blog' } },
        { label: 'Study', autogenerate: { directory: 'study' } },
        { label: 'Retrospectives', autogenerate: { directory: 'retrospectives' } },
        { label: 'Projects', autogenerate: { directory: 'projects' } },
        { label: 'About', link: '/about/' },
      ],
    }),
  ],
});
