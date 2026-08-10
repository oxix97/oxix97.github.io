import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

type FrontmatterValue =
  | boolean
  | number
  | string
  | string[]
  | Record<string, boolean | number | string | string[]>;

type ArticleContract = {
  file: string;
  title: string;
  order: number;
  draft: boolean;
  tags: string[];
  units: { title: string; unitId: number }[];
};

const studyRoot = new URL('../src/content/docs/study/', import.meta.url);
const inflearnCoursePrefix =
  'https://www.inflearn.com/courses/lecture?courseId=328823&unitId=';
const courseUrl = (unitId: number) => `${inflearnCoursePrefix}${unitId}`;

const articles: ArticleContract[] = [
  {
    file: 'introduction.md',
    title: '디자인 패턴이란 무엇인가',
    order: 1,
    draft: false,
    tags: ['Design Pattern', 'Architecture'],
    units: [
      { title: '디자인패턴 소개 ★★★', unitId: 116050 },
      { title: '라이브러리와 프레임워크의 차이 ★★★', unitId: 162758 },
    ],
  },
  {
    file: 'singleton-basics.md',
    title: '싱글톤 패턴의 원리와 장단점',
    order: 2,
    draft: false,
    tags: ['Design Pattern', 'Singleton', 'Java'],
    units: [{ title: '싱글톤 패턴 ★★★', unitId: 116055 }],
  },
  {
    file: 'singleton-implementations.md',
    title: '싱글톤 구현 방식 비교',
    order: 3,
    draft: false,
    tags: ['Design Pattern', 'Singleton', 'Java', 'Concurrency'],
    units: [
      {
        title: 'DEEP DIVE : 싱글톤 패턴을 구현하는 7가지 방법 #1 ★★☆',
        unitId: 132521,
      },
      {
        title: 'DEEP DIVE : 싱글톤 패턴을 구현하는 7가지 방법 #2 ★★☆',
        unitId: 132522,
      },
    ],
  },
  {
    file: 'factory-and-iterator.md',
    title: '팩토리 패턴과 이터레이터 패턴',
    order: 4,
    draft: false,
    tags: ['Design Pattern', 'Factory', 'Iterator'],
    units: [
      { title: '팩토리패턴 ★★★', unitId: 118502 },
      { title: '이터레이터패턴 ★☆☆', unitId: 118503 },
    ],
  },
  {
    file: 'dependency-injection-and-strategy.md',
    title: 'DI·DIP와 전략 패턴',
    order: 5,
    draft: false,
    tags: ['Design Pattern', 'Dependency Injection', 'Strategy', 'Spring'],
    units: [
      { title: 'DI와 DIP ★★★', unitId: 118490 },
      { title: '전략패턴 ★★★', unitId: 118504 },
      {
        title: 'Q. 전략패턴과 의존성주입의 차이는 무엇인가요? ★☆☆',
        unitId: 120148,
      },
      { title: 'Q. 컨텍스트란 무엇인가요? ★☆☆', unitId: 120149 },
    ],
  },
  {
    file: 'observer-and-proxy.md',
    title: '옵저버 패턴과 프록시 패턴',
    order: 6,
    draft: false,
    tags: ['Design Pattern', 'Observer', 'Proxy', 'Spring'],
    units: [
      { title: '옵저버 패턴 ★★☆', unitId: 116058 },
      { title: '프록시 패턴 ★★★', unitId: 116059 },
    ],
  },
  {
    file: 'mvc-mvp-mvvm.md',
    title: 'MVC·MVP·MVVM과 Spring MVC',
    order: 7,
    draft: false,
    tags: ['Design Pattern', 'MVC', 'MVVM', 'Spring MVC'],
    units: [
      {
        title: 'MVC패턴과 MVP패턴 그리고 MVVM패턴 ★★★',
        unitId: 116060,
      },
      { title: 'Spring의 MVC패턴 적용사례 ★★★', unitId: 139952 },
    ],
  },
  {
    file: 'flux-and-review.md',
    title: 'Flux 패턴과 디자인 패턴 총정리',
    order: 8,
    draft: false,
    tags: ['Design Pattern', 'Flux', 'Architecture', 'Interview'],
    units: [{ title: 'flux패턴 ★★★', unitId: 118705 }],
  },
];

const articleHref = (article: ArticleContract) =>
  `./${article.file.replace(/\.md$/, '/')}`;
const articleRoute = (article: ArticleContract) =>
  `/study/design-patterns/${article.file.replace(/\.md$/, '/')}`;
const readStudyFile = (path: string) => readFile(new URL(path, studyRoot), 'utf8');

function parseScalar(value: string): boolean | number | string | string[] {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim());
  }
  return value;
}

function parseFrontmatter(markdown: string): Record<string, FrontmatterValue> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error('frontmatter block is missing');

  const parsed: Record<string, FrontmatterValue> = {};
  let parentKey: string | undefined;

  for (const line of match[1].split('\n')) {
    const field = line.match(/^(\s*)([A-Za-z][\w]*):(?:\s*(.*))?$/);
    if (!field) throw new Error(`unsupported frontmatter line: ${line}`);

    const [, indentation, key, rawValue = ''] = field;
    if (indentation.length === 0) {
      if (rawValue === '') {
        parsed[key] = {};
        parentKey = key;
      } else {
        parsed[key] = parseScalar(rawValue);
        parentKey = undefined;
      }
      continue;
    }

    const parent = parentKey ? parsed[parentKey] : undefined;
    if (!parentKey || typeof parent !== 'object' || Array.isArray(parent)) {
      throw new Error(`frontmatter nesting is invalid: ${line}`);
    }
    parent[key] = parseScalar(rawValue);
  }

  return parsed;
}

function extractSection(markdown: string, heading: string): string {
  const marker = `## ${heading}\n`;
  const start = markdown.indexOf(marker);
  if (start === -1) throw new Error(`section is missing: ${heading}`);
  const contentStart = start + marker.length;
  const nextHeading = markdown.indexOf('\n## ', contentStart);
  return markdown.slice(
    contentStart,
    nextHeading === -1 ? markdown.length : nextHeading,
  );
}

function extractMarkdownLinks(markdown: string) {
  return [...markdown.matchAll(/\[([^\]]+)]\(([^)]+)\)/g)].map(
    ([, title, href]) => ({ title, href }),
  );
}

function extractInterviewAnswers(markdown: string) {
  const section = extractSection(markdown, '기술면접 질문');
  const headings = [...section.matchAll(/^### (.+)$/gm)];
  return headings.map((heading, index) => {
    const bodyStart = (heading.index ?? 0) + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? section.length;
    return {
      question: heading[1],
      answer: section.slice(bodyStart, bodyEnd).trim(),
    };
  });
}

function splitSentences(answer: string) {
  return answer
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function expectedNavigation(index: number) {
  const parts: string[] = [];
  if (index > 0) {
    const previous = articles[index - 1];
    parts.push(`이전: [${previous.title}](${articleRoute(previous)})`);
  }
  parts.push('[연재 목록](/study/design-patterns/)');
  if (index < articles.length - 1) {
    const next = articles[index + 1];
    parts.push(`다음: [${next.title}](${articleRoute(next)})`);
  }
  return parts.join(' · ');
}

describe('design pattern Study series', () => {
  it('links the series from the Study index', async () => {
    const studyIndex = await readStudyFile('index.md');
    expect(studyIndex).toContain(
      '[CS 지식의 정석 - 디자인 패턴](/study/design-patterns/)',
    );
  });

  it('defines all eight articles as exact links in reading order', async () => {
    const hub = await readStudyFile('cs/design-pattern/index.md');
    const frontmatter = parseFrontmatter(hub);
    const readingOrder = extractSection(hub, '읽는 순서');
    const links = [
      ...readingOrder.matchAll(/^\d+\.\s+\[([^\]]+)]\(([^)]+)\)$/gm),
    ].map(([, title, href]) => ({ title, href }));

    expect(frontmatter.title).toBe('CS 지식의 정석 - 디자인 패턴');
    expect(links).toEqual(
      articles.map((article) => ({
        title: article.title,
        href: articleHref(article),
      })),
    );
  });

  it('keeps the exact previous, list, and next navigation chain', async () => {
    for (const [index, article] of articles.entries()) {
      const markdown = await readStudyFile(`cs/design-pattern/${article.file}`);
      expect(markdown.trimEnd().split('\n').at(-1)).toBe(
        expectedNavigation(index),
      );
    }
  });

  it('keeps 2-4 ordered interview answers with exactly three sentences', async () => {
    let answerCount = 0;

    for (const article of articles) {
      const markdown = await readStudyFile(`cs/design-pattern/${article.file}`);
      const answers = extractInterviewAnswers(markdown);

      expect(answers.length, article.file).toBeGreaterThanOrEqual(2);
      expect(answers.length, article.file).toBeLessThanOrEqual(4);
      for (const { question, answer } of answers) {
        expect(question, article.file).not.toBe('');
        expect(answer, `${article.file}: ${question}`).not.toContain('\n\n');
        expect(
          splitSentences(answer),
          `${article.file}: ${question}`,
        ).toHaveLength(3);
      }
      answerCount += answers.length;
    }

    expect(answerCount).toBe(29);
  });

  for (const article of articles) {
    it(`keeps the parsed content contract for ${article.file}`, async () => {
      const markdown = await readStudyFile(`cs/design-pattern/${article.file}`);
      const frontmatter = parseFrontmatter(markdown);

      expect(frontmatter.title).toBe(article.title);
      expect(frontmatter.contentType).toBe('study');
      expect(frontmatter.publishedAt).toBe('2026-08-10');
      expect(frontmatter.tags).toEqual(article.tags);
      expect(frontmatter.series).toBe('CS 지식의 정석 - 디자인 패턴');
      expect(frontmatter.topic).toBe('Design Pattern');
      expect(frontmatter.difficulty).toBe('intermediate');
      expect(frontmatter.draft ?? false).toBe(article.draft);
      expect(frontmatter.sidebar).toEqual({ order: article.order });

      for (const heading of [
        '핵심 요약',
        '장점과 한계',
        '기술면접 질문',
        '복습 체크리스트',
        '참고 자료',
      ]) {
        expect(() => extractSection(markdown, heading)).not.toThrow();
      }

      const officialLinks = extractMarkdownLinks(
        extractSection(markdown, '참고 자료'),
      ).filter(({ href }) => href.startsWith(inflearnCoursePrefix));
      expect(officialLinks).toEqual(
        article.units.map(({ title, unitId }) => ({
          title,
          href: courseUrl(unitId),
        })),
      );
    });
  }
});
