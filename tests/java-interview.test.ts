import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const docsRoot = new URL('../src/content/docs/', import.meta.url);
const configUrl = new URL('../astro.config.mjs', import.meta.url);

const categories = [
  { file: 'basics-and-oop.mdx', first: 1, last: 20 },
  { file: 'object-string-immutability.mdx', first: 21, last: 30 },
  { file: 'primitive-wrapper-generics.mdx', first: 31, last: 40 },
  { file: 'collections.mdx', first: 41, last: 60 },
  { file: 'exceptions.mdx', first: 61, last: 70 },
  { file: 'jvm-memory-gc.mdx', first: 71, last: 85 },
  { file: 'threads-and-concurrency.mdx', first: 86, last: 100 },
];

const readDoc = (path: string) => readFile(new URL(path, docsRoot), 'utf8');

describe('Java interview question collection', () => {
  it('provides an interview landing page and a Java study guide', async () => {
    const [interview, java] = await Promise.all([
      readDoc('interview/index.md'),
      readDoc('interview/java/index.md'),
    ]);

    expect(interview).toContain('Java 면접 질문');
    expect(interview).toContain('/interview/java/');
    expect(java).toContain('Java 100문제 학습 우선순위');
    expect(java).toContain('S급 — 반드시 설명할 수 있어야 함');
    expect(java).not.toContain('Q1. Java 100개 중');
  });

  it('keeps questions 1 through 100 unique and in category order', async () => {
    const numbers: number[] = [];

    for (const category of categories) {
      const content = await readDoc(`interview/java/${category.file}`);
      const categoryNumbers = [...content.matchAll(/<summary>(\d+)\./g)].map((match) =>
        Number(match[1]),
      );

      expect(categoryNumbers).toEqual(
        Array.from(
          { length: category.last - category.first + 1 },
          (_, index) => category.first + index,
        ),
      );
      numbers.push(...categoryNumbers);
    }

    expect(numbers).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
    expect(new Set(numbers).size).toBe(100);
  });

  it('renders every question as a native, initially closed disclosure', async () => {
    for (const category of categories) {
      const content = await readDoc(`interview/java/${category.file}`);
      const summaries = content.match(/<summary>/g) ?? [];
      const details = content.match(/<details class="interview-question">/g) ?? [];
      const answers = content.match(/### 면접 답변/g) ?? [];

      expect(details).toHaveLength(summaries.length);
      expect(answers).toHaveLength(summaries.length);
      expect(content).not.toMatch(/<details[^>]*\sopen(?:\s|>)/);
    }
  });

  it('hides the generated table of contents on individual question pages', async () => {
    for (const category of categories) {
      const content = await readDoc(`interview/java/${category.file}`);

      expect(content).toMatch(/^tableOfContents: false$/m);
    }
  });

  it('marks generic type names as code so MDX does not parse them as tags', async () => {
    const collections = await readDoc('interview/java/collections.mdx');

    expect(collections).toContain(
      '* int[]와 `List<Integer>`의 성능 차이는 무엇인가요?',
    );
  });

  it('exposes the Java category hierarchy in the Starlight sidebar', async () => {
    const config = await readFile(configUrl, 'utf8');

    expect(config).toContain("label: 'Java'");
    expect(config).toContain("autogenerate: { directory: 'interview/java' }");
  });
});
