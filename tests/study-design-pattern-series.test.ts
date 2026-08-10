import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

type ArticleContract = {
  file: string;
  title: string;
  order: number;
  draft: boolean;
  unitIds: number[];
};

const studyRoot = new URL('../src/content/docs/study/', import.meta.url);
const articles: ArticleContract[] = [
  {
    file: 'introduction.md',
    title: '디자인 패턴이란 무엇인가',
    order: 1,
    draft: false,
    unitIds: [116050, 162758],
  },
  {
    file: 'singleton-basics.md',
    title: '싱글톤 패턴의 원리와 장단점',
    order: 2,
    draft: false,
    unitIds: [116055],
  },
];

const readStudyFile = (path: string) => readFile(new URL(path, studyRoot), 'utf8');

describe('design pattern Study series', () => {
  it('links the series from the Study index', async () => {
    const studyIndex = await readStudyFile('index.md');
    expect(studyIndex).toContain(
      '[CS 지식의 정석 - 디자인 패턴](./design-patterns/)',
    );
  });

  it('defines the complete reading order in the series hub', async () => {
    const hub = await readStudyFile('design-patterns/index.md');

    expect(hub).toContain('title: CS 지식의 정석 - 디자인 패턴');
    const titles = [
      '디자인 패턴이란 무엇인가',
      '싱글톤 패턴의 원리와 장단점',
      '싱글톤 구현 방식 비교',
      '팩토리 패턴과 이터레이터 패턴',
      'DI·DIP와 전략 패턴',
      '옵저버 패턴과 프록시 패턴',
      'MVC·MVP·MVVM과 Spring MVC',
      'Flux 패턴과 디자인 패턴 총정리',
    ];
    for (const title of titles) {
      expect(hub).toContain(title);
    }
    const titlePositions = titles.map((title) => hub.indexOf(title));
    expect(titlePositions).toEqual([...titlePositions].sort((a, b) => a - b));
  });

  for (const article of articles) {
    it(`keeps the content contract for ${article.file}`, async () => {
      const markdown = await readStudyFile(`design-patterns/${article.file}`);

      expect(markdown).toContain(`title: ${article.title}`);
      expect(markdown).toContain('contentType: study');
      expect(markdown).toContain('series: CS 지식의 정석 - 디자인 패턴');
      expect(markdown).toContain('topic: Design Pattern');
      expect(markdown).toContain(`order: ${article.order}`);
      if (article.draft) {
        expect(markdown).toContain('draft: true');
      } else {
        expect(markdown).not.toContain('draft: true');
      }

      for (const heading of [
        '## 핵심 요약',
        '## 장점과 한계',
        '## 기술면접 질문',
        '## 복습 체크리스트',
        '## 참고 자료',
      ]) {
        expect(markdown).toContain(heading);
      }

      for (const unitId of article.unitIds) {
        expect(markdown).toContain(
          `https://www.inflearn.com/courses/lecture?courseId=328823&unitId=${unitId}`,
        );
      }
    });
  }
});
