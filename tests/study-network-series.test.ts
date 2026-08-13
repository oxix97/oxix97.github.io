import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

type FrontmatterValue =
  | boolean
  | number
  | string
  | string[]
  | Record<string, boolean | number | string | string[]>;

type ImageContract = {
  file: string;
};

type ArticleContract = {
  file: string;
  title: string;
  order: number;
  publishedAt: string;
  tags: string[];
  units: { title: string; unitId: number }[];
  sections: string[];
  images?: ImageContract[];
};

const studyRoot = new URL('../src/content/docs/study/', import.meta.url);
const publicRoot = new URL('../public/', import.meta.url);
const readPublicFile = (path: string) =>
  readFile(new URL(path, publicRoot), 'utf8');
const inflearnCoursePrefix =
  'https://www.inflearn.com/courses/lecture?courseId=328823&unitId=';
const courseUrl = (unitId: number) => `${inflearnCoursePrefix}${unitId}`;

const articles: ArticleContract[] = [
  {
    file: 'network-performance-metrics.md',
    title: '대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이',
    order: 1,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Performance', 'RTT', 'Backend'],
    units: [
      {
        title:
          '네트워크의 기초 #1. 네트워크, 처리량, 트래픽, 대역폭, RTT ★★★',
        unitId: 121330,
      },
    ],
    sections: [
      '핵심 요약',
      '트래픽과 처리량의 차이',
      '대역폭과 실제 처리량이 다른 이유',
      'RTT가 API 응답 시간에 미치는 영향',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'topology-and-bottlenecks.md',
    title: '연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석',
    order: 2,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Topology', 'Bottleneck', 'Backend'],
    units: [
      {
        title: '네트워크의 기초 #2. 네트워크 토폴로지 : 버스, 스타, 트리 ★★★',
        unitId: 121331,
      },
      {
        title: '네트워크의 기초 #3. 네트워크 토폴로지 : 링, 메시 ★★★',
        unitId: 121332,
      },
      {
        title: '네트워크의 기초 #4.  병목현상과 네트워크 토폴로지의 필요성 ★★★',
        unitId: 130662,
      },
    ],
    sections: [
      '핵심 요약',
      '버스형·스타형·트리형 토폴로지',
      '링형·메시형 토폴로지',
      '연결 구조에서 병목이 발생하는 지점',
      '백엔드 시스템에서 병목을 찾는 순서',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'network-classification.md',
    title: '유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준',
    order: 3,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Unicast', 'LAN', 'Backend'],
    units: [
      {
        title: '네트워크의 기초 #5. 유니캐스트, 멀티캐스트, 브로드캐스트 ★★★',
        unitId: 164725,
      },
      { title: '네트워크의 분류 : LAN, MAN, WAN ★☆☆', unitId: 130855 },
    ],
    sections: [
      '핵심 요약',
      '전달 대상에 따른 분류',
      '유니캐스트·멀티캐스트·브로드캐스트 비교',
      '통신 범위에 따른 분류',
      'LAN·MAN·WAN 비교',
      '백엔드 통신은 어떤 방식에 해당하는가',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'tcp-ip-layers-and-encapsulation.md',
    title: 'TCP/IP 4계층은 데이터를 어떻게 전달하는가',
    order: 4,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCPIP', 'Encapsulation', 'Backend'],
    units: [
      {
        title: 'TCP/IP 4계층 #1. 개념, 캡슐화, 비캡슐화, PDU, OSI 7계층 ★★★',
        unitId: 116066,
      },
      {
        title: 'TCP/IP 4계층 #3. 애플리케이션 계층(application) ★★★',
        unitId: 116067,
      },
      {
        title: 'TCP/IP 4계층 #5. 인터넷 계층(network) ★★★',
        unitId: 132275,
      },
    ],
    sections: [
      '핵심 요약',
      'TCP/IP 4계층의 책임',
      '계층별 PDU와 대표 프로토콜',
      '캡슐화와 역캡슐화',
      'OSI 7계층과 어떻게 대응하는가',
      'HTTP 요청이 네트워크를 통과하는 과정',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'tcp-ip-layer-stack.svg',
      },
      {
        file: 'tcp-encapsulation-flow.svg',
      },
    ],
  },
  {
    file: 'tcp-udp-mtu-mss-pmtud.md',
    title: 'TCP와 UDP, 그리고 MTU·MSS·PMTUD',
    order: 5,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCP', 'UDP', 'PMTUD'],
    units: [
      {
        title: 'TCP/IP 4계층 #4. 전송 계층(transport) ★★★',
        unitId: 132274,
      },
      {
        title: 'TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★',
        unitId: 116686,
      },
    ],
    sections: [
      '핵심 요약',
      'TCP와 UDP의 선택 기준',
      'TCP의 신뢰성을 구성하는 장치',
      'MTU와 MSS의 차이',
      'PMTUD가 경로 크기를 찾는 방법',
      '운영에서 확인할 실패 조건',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'mtu-mss-packet.svg',
      },
      {
        file: 'pmtud-path.svg',
      },
    ],
  },
  {
    file: 'tcp-connection-lifecycle.md',
    title: 'TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지',
    order: 6,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCP', 'Handshake', 'TIME_WAIT'],
    units: [
      {
        title: 'TCP의 연결성립 : 3-웨이 핸드셰이크 ★★★',
        unitId: 116078,
      },
      {
        title: 'TCP의 연결해제 : 4-웨이 핸드셰이크와TIME_WAIT ★★★',
        unitId: 130876,
      },
    ],
    sections: [
      '핵심 요약',
      '3-way handshake가 확인하는 것',
      'ISN과 Sequence·Acknowledgement Number',
      '4-way handshake에서 FIN과 ACK가 분리되는 이유',
      'TIME_WAIT이 필요한 이유',
      'CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'tcp-three-way-handshake.svg',
      },
      {
        file: 'tcp-four-way-handshake-time-wait.svg',
      },
    ],
  },
  {
    file: 'routing-and-routing-table.md',
    title: '라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블',
    order: 7,
    publishedAt: '2026-08-13',
    tags: ['Network', 'Routing', 'Router', 'Backend'],
    units: [
      {
        title: '라우팅 #1. 개념과 라우터 ★★★',
        unitId: 116653,
      },
      {
        title: '라우팅 #2. 라우팅테이블 ★★★',
        unitId: 131314,
      },
    ],
    sections: [
      '핵심 요약',
      '라우팅·라우터·라우팅 테이블의 관계',
      '라우팅 테이블에서 읽어야 할 정보',
      '가장 긴 프리픽스가 먼저 선택되는 이유',
      '`ip route` 출력 읽기',
      '라우팅 테이블을 운영에서 확인하는 순서',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
];

const articleRoute = (article: ArticleContract) =>
  `/study/network/${article.file.replace(/\.md$/, '/')}`;
const readStudyFile = (path: string) => readFile(new URL(path, studyRoot), 'utf8');

function parseScalar(value: string): boolean | number | string | string[] {
  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  if (isQuoted) return value.slice(1, -1);
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
  parts.push('[연재 목록](/study/network/)');
  if (index < articles.length - 1) {
    const next = articles[index + 1];
    parts.push(`다음: [${next.title}](${articleRoute(next)})`);
  }
  return parts.join(' · ');
}

describe('network Study series', () => {
  it('links the series from the Study index', async () => {
    const studyIndex = await readStudyFile('index.md');
    expect(studyIndex).toContain('[CS 지식의 정석 - 네트워크](/study/network/)');
  });

  it('defines all seven articles as exact links in reading order', async () => {
    const hub = await readStudyFile('cs/network/index.md');
    const frontmatter = parseFrontmatter(hub);
    const readingOrder = extractSection(hub, '읽는 순서');
    const links = [
      ...readingOrder.matchAll(/^\d+\.\s+\[([^\]]+)]\(([^)]+)\)$/gm),
    ].map(([, title, href]) => ({ title, href }));

    expect(frontmatter.title).toBe('CS 지식의 정석 - 네트워크');
    expect(links).toEqual(
      articles.map(({ file, title }) => ({
        title,
        href: `./${file.replace(/\.md$/, '/')}`,
      })),
    );
  });

  it('keeps the exact previous, list, and next navigation chain', async () => {
    for (const [index, article] of articles.entries()) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      expect(markdown.trimEnd().split('\n').at(-1)).toBe(
        expectedNavigation(index),
      );
    }
  });

  it('keeps exactly three interview answers with exactly three sentences', async () => {
    let answerCount = 0;

    for (const article of articles) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      const answers = extractInterviewAnswers(markdown);

      expect(answers, article.file).toHaveLength(3);
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

    expect(answerCount).toBe(articles.length * 3);
  });

  it('keeps accessible static SVG diagrams for each illustrated article', async () => {
    for (const article of articles) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      for (const diagram of article.images ?? []) {
        const assetPath = `images/study/network/tcp/${diagram.file}`;
        const svg = await readPublicFile(assetPath);
        expect(svg, diagram.file).toMatch(/^<svg[\s>]/);
        expect(svg, diagram.file).toContain('<title');
        expect(svg, diagram.file).toContain('<desc');
        const figure = markdown.match(
          new RegExp(
            `<figure class="study-diagram">[\\s\\S]*?src="/${assetPath}"[\\s\\S]*?</figure>`,
          ),
        )?.[0];
        expect(figure, diagram.file).toBeDefined();
        expect(figure, diagram.file).toMatch(/alt="[^"]+"/);
        expect(figure, diagram.file).toContain('loading="lazy"');
        expect(figure, diagram.file).toMatch(
          /<figcaption>\s*\S[\s\S]*?<\/figcaption>/,
        );
      }
    }
  });

  it('distinguishes Kafka consumer distribution from IP multicast', async () => {
    const markdown = await readStudyFile('cs/network/network-classification.md');
    const section = extractSection(
      markdown,
      '백엔드 통신은 어떤 방식에 해당하는가',
    );

    expect(section).toMatch(
      /Kafka 소비자 그룹의 (?:메시지 )?분배는 네트워크 계층의 IP 멀티캐스트와 (?:같지 않|다르)/,
    );
  });

  for (const article of articles) {
    it(`keeps the parsed content contract for ${article.file}`, async () => {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      const frontmatter = parseFrontmatter(markdown);

      expect(frontmatter.title).toBe(article.title);
      expect(frontmatter.contentType).toBe('study');
      expect(frontmatter.publishedAt).toBe(article.publishedAt);
      expect(frontmatter.tags).toEqual(article.tags);
      expect(frontmatter.series).toBe('CS 지식의 정석 - 네트워크');
      expect(frontmatter.topic).toBe('Network');
      expect(frontmatter.difficulty).toBe('intermediate');
      expect(frontmatter.draft ?? false).toBe(false);
      expect(frontmatter.sidebar).toEqual({ order: article.order });

      for (const heading of article.sections) {
        expect(() => extractSection(markdown, heading)).not.toThrow();
      }

      if (article.file === 'network-performance-metrics.md') {
        const rttSection = extractSection(
          markdown,
          'RTT가 API 응답 시간에 미치는 영향',
        );
        expect(rttSection).toMatch(
          /애플리케이션 처리 시간과 네트워크 왕복 시간을 분리/,
        );
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
