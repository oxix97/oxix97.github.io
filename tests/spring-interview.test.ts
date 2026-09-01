import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const docsRoot = new URL('../src/content/docs/', import.meta.url);
const configUrl = new URL('../astro.config.mjs', import.meta.url);

const categories = [
  { file: 'spring-core.mdx', first: 1, last: 20 },
  { file: 'dependency-injection-proxy-aop.mdx', first: 21, last: 30 },
  { file: 'spring-mvc-http.mdx', first: 31, last: 50 },
  { file: 'validation-exception.mdx', first: 51, last: 60 },
  { file: 'transaction.mdx', first: 61, last: 75 },
  { file: 'jpa-hibernate.mdx', first: 76, last: 95 },
  { file: 'spring-boot-test-operations.mdx', first: 96, last: 100 },
];

const readDoc = (path: string) => readFile(new URL(path, docsRoot), 'utf8');

describe('Spring interview question collection', () => {
  it('links the interview landing page to the Spring study guide', async () => {
    const [interview, spring] = await Promise.all([
      readDoc('interview/index.md'),
      readDoc('interview/spring/index.md'),
    ]);

    expect(interview).toContain('Spring 면접 질문 100선');
    expect(interview).toContain('/interview/spring/');
    expect(spring).toContain('Spring 면접에서 특히 중요한 30개');
    expect(spring).toContain('@Transactional');
    expect(spring).toContain('N+1');
  });

  it('keeps questions 1 through 100 unique and in category order', async () => {
    const numbers: number[] = [];

    for (const category of categories) {
      const content = await readDoc(`interview/spring/${category.file}`);
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
      const content = await readDoc(`interview/spring/${category.file}`);
      const summaries = content.match(/<summary>/g) ?? [];
      const details = content.match(/<details class="interview-question">/g) ?? [];
      const answers = content.match(/### 면접 답변/g) ?? [];

      expect(details).toHaveLength(summaries.length);
      expect(answers).toHaveLength(summaries.length);
      expect(content).not.toMatch(/<details[^>]*\sopen(?:\s|>)/);
    }
  });

  it('does not mistake source category headings for numbered questions', async () => {
    const springCore = await readDoc('interview/spring/spring-core.mdx');

    expect(springCore).toContain(
      '<summary>2. Spring과 Spring Boot의 차이는 무엇인가요?</summary>',
    );
    expect(springCore).not.toMatch(/^## \d+\./m);
  });

  it('omits prompt artifacts from the published Spring guide', async () => {
    const springIndex = await readDoc('interview/spring/index.md');

    expect(springIndex).not.toContain('**Q1.');
    expect(springIndex).not.toContain('**Q2.');
    expect(springIndex).not.toContain('**Q3.');
  });

  it('exposes the Spring category hierarchy in the Starlight sidebar', async () => {
    const config = await readFile(configUrl, 'utf8');

    expect(config).toContain("label: 'Spring'");
    expect(config).toContain("autogenerate: { directory: 'interview/spring' }");
  });
});
