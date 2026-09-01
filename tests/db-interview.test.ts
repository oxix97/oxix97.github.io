import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const docsRoot = new URL('../src/content/docs/', import.meta.url);
const configUrl = new URL('../astro.config.mjs', import.meta.url);

const categories = [
  { file: 'database-rdb-basics.mdx', first: 1, last: 15 },
  { file: 'sql.mdx', first: 16, last: 30 },
  { file: 'indexes.mdx', first: 31, last: 50 },
  { file: 'execution-plan-performance.mdx', first: 51, last: 60 },
  { file: 'transactions-acid.mdx', first: 61, last: 80 },
  { file: 'locks-concurrency-mvcc.mdx', first: 81, last: 90 },
  { file: 'mysql-postgresql-internals-practice.mdx', first: 91, last: 100 },
];

const readDoc = (path: string) => readFile(new URL(path, docsRoot), 'utf8');

describe('DB interview question collection', () => {
  it('links the interview landing page to the DB study guide', async () => {
    const [interview, database] = await Promise.all([
      readDoc('interview/index.md'),
      readDoc('interview/db/index.md'),
    ]);

    expect(interview).toContain('DB 면접 질문 100선');
    expect(interview).toContain('/interview/db/');
    expect(database).toContain('DB 면접에서 특히 중요한 35개');
    expect(database).toContain('Index 질문 연결 구조');
    expect(database).toContain('Transaction 질문 연결 구조');
    expect(database).toContain('면접에서 피해야 할 답변');
    expect(database).toContain('Java → Spring → DB');
  });

  it('keeps questions 1 through 100 unique and in category order', async () => {
    const numbers: number[] = [];

    for (const category of categories) {
      const content = await readDoc(`interview/db/${category.file}`);
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
    let totalDetails = 0;
    let totalSummaries = 0;

    for (const category of categories) {
      const content = await readDoc(`interview/db/${category.file}`);
      const summaries = content.match(/<summary>/g) ?? [];
      const details = content.match(/<details class="interview-question">/g) ?? [];
      const closingDetails = content.match(/<\/details>/g) ?? [];
      const answers = content.match(/### 면접 답변/g) ?? [];

      expect(details).toHaveLength(summaries.length);
      expect(closingDetails).toHaveLength(summaries.length);
      expect(answers).toHaveLength(summaries.length);
      expect(content).not.toMatch(/<details[^>]*\sopen(?:\s|>)/);

      totalDetails += details.length;
      totalSummaries += summaries.length;
    }

    expect(totalDetails).toBe(100);
    expect(totalSummaries).toBe(100);
  });

  it('publishes the intended category links and omits prompt artifacts', async () => {
    const database = await readDoc('interview/db/index.md');

    for (const category of categories) {
      expect(database).toContain(`./${category.file.replace(/\.mdx$/, '')}/`);
    }

    expect(database).not.toContain('**Q1.');
    expect(database).not.toContain('**Q2.');
    expect(database).not.toContain('**Q3.');
  });

  it('states the version scope and cites the official DBMS manuals', async () => {
    const database = await readDoc('interview/db/index.md');

    expect(database).toContain('MySQL 8.4');
    expect(database).toContain('PostgreSQL 18');
    expect(database).toContain('https://dev.mysql.com/doc/refman/8.4/en/');
    expect(database).toContain('https://www.postgresql.org/docs/18/');
  });

  it('exposes the DB category hierarchy in the Starlight sidebar', async () => {
    const config = await readFile(configUrl, 'utf8');

    expect(config).toContain("label: 'DB'");
    expect(config).toContain("autogenerate: { directory: 'interview/db' }");
  });
});
