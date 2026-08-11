import { readFile } from 'node:fs/promises';

const requiredViewBox = '0 0 1200 720';
const minimumEssentialFontSize = 42;
const requiredContrast = 4.5;

const contracts = {
  'public/images/study/network/tcp/tcp-ip-layer-stack.svg': {
    labels: {
      'TCP/IP 4계층과 PDU': 1,
      애플리케이션: 1,
      'HTTP · SMTP': 1,
      메시지: 1,
      전송: 1,
      'TCP · UDP': 1,
      'TCP 세그먼트 · UDP 데이터그램': 1,
      인터넷: 1,
      'IP · ICMP': 1,
      'IP 패킷': 1,
      '네트워크 접근': 1,
      'Ethernet · Wi-Fi': 1,
      프레임: 1,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'violet'],
      ['#ffffff', 'green'],
      ['#ffffff', 'amber'],
      ['blue', '#eff6ff'],
      ['violet', '#f5f3ff'],
      ['green', '#ecfdf5'],
      ['amber', '#fff7ed'],
    ],
  },
  'public/images/study/network/tcp/tcp-encapsulation-flow.svg': {
    labels: {
      'TCP 기반 HTTP/1.1 캡슐화': 1,
      '송신: 캡슐화': 1,
      '수신: 역캡슐화': 1,
      'HTTP/1.1': 2,
      'TCP 세그먼트': 2,
      'IP 패킷': 2,
      '링크 프레임': 2,
      네트워크: 1,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'violet'],
      ['#ffffff', 'green'],
      ['#ffffff', 'amber'],
      ['ink', '#ffffff'],
    ],
  },
  'public/images/study/network/tcp/mtu-mss-packet.svg': {
    labels: {
      'MTU와 MSS의 관계': 1,
      'MTU 1500 B': 1,
      'IP 패킷 전체': 1,
      'IPv4 헤더': 1,
      'TCP 헤더': 1,
      '20 B': 2,
      'TCP 데이터': 1,
      '1460 B': 1,
      'MSS = 1460 B': 1,
      '옵션 없는 IPv4·TCP 예시': 1,
      '헤더·터널 조건에 따라 달라짐': 1,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'violet'],
      ['#ffffff', 'green'],
      ['#ffffff', 'amber'],
      ['ink', '#eff6ff'],
      ['ink', '#fff7ed'],
    ],
  },
  'public/images/study/network/tcp/pmtud-path.svg': {
    labels: {
      'PMTUD: 경로 MTU 찾기': 1,
      송신자: 1,
      'MTU 1500': 1,
      'MTU 1400': 1,
      수신자: 1,
      '1 · 1500 B 전송': 1,
      '2 · ICMP: MTU 1400': 1,
      '3 · 1400 B 이하 재전송': 1,
      '경로 MTU = 1400 B': 1,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'violet'],
      ['#ffffff', 'green'],
      ['#ffffff', 'amber'],
      ['ink', '#eff6ff'],
      ['ink', '#fff7ed'],
      ['ink', '#ecfdf5'],
    ],
  },
  'public/images/study/network/tcp/tcp-three-way-handshake.svg': {
    labels: {
      'TCP 연결 수립: 3-way handshake': 1,
      '연결 시작 측': 1,
      '수신 측': 1,
      CLOSED: 1,
      LISTEN: 1,
      SYN: 1,
      'seq=x': 1,
      SYN_SENT: 1,
      SYN_RECEIVED: 1,
      'SYN-ACK': 1,
      'seq=y · ack=x+1': 1,
      ACK: 1,
      'ack=y+1': 1,
      ESTABLISHED: 2,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'green'],
      ['ink', '#e2e8f0'],
      ['ink', '#fef3c7'],
      ['ink', '#ede9fe'],
      ['ink', '#dcfce7'],
      ['blue', 'bg'],
      ['violet', 'bg'],
      ['green', 'bg'],
      ['danger', 'bg'],
    ],
  },
  'public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg': {
    labels: {
      'TCP 연결 종료: 4-way handshake': 1,
      '종료 시작 측': 1,
      '상대 측': 1,
      ESTABLISHED: 2,
      FIN: 2,
      FIN_WAIT_1: 1,
      CLOSE_WAIT: 1,
      ACK: 1,
      FIN_WAIT_2: 1,
      LAST_ACK: 1,
      '마지막 ACK': 1,
      TIME_WAIT: 1,
      CLOSED: 2,
    },
    contrastPairs: [
      ['#ffffff', 'blue'],
      ['#ffffff', 'green'],
      ['ink', '#dcfce7'],
      ['ink', '#ede9fe'],
      ['ink', '#fef3c7'],
      ['ink', '#e2e8f0'],
      ['blue', 'bg'],
      ['danger', 'bg'],
    ],
    verifyGeometry: true,
  },
};

function parseAttributes(source) {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
  );
}

function parseStyle(svg) {
  const styles = {};
  const styleSource = [...svg.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .map(([, source]) => source)
    .join('\n');
  for (const [, selectors, rules] of styleSource.matchAll(/([^{}]+)\{([^}]+)\}/g)) {
    const declarations = Object.fromEntries(
      [...rules.matchAll(/([\w-]+)\s*:\s*([^;}]+)/g)].map(([, property, value]) => [
        property,
        value.trim(),
      ]),
    );
    for (const selector of selectors.split(',')) {
      const className = selector.trim().match(/^\.([\w-]+)$/)?.[1];
      if (className) styles[className] = { ...styles[className], ...declarations };
    }
  }
  return styles;
}

function parseTags(svg, tagName) {
  return [...svg.matchAll(new RegExp(`<${tagName}\\b([^>]*)>`, 'g'))].map(([, attributes]) =>
    parseAttributes(attributes),
  );
}

function parseText(svg, styles) {
  return [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(([, source, content]) => {
    const attributes = parseAttributes(source);
    const classes = attributes.class?.split(/\s+/) ?? [];
    const classFontSize = classes.map((className) => styles[className]?.['font-size']).find(Boolean);
    return {
      attributes,
      content: content.trim(),
      fontSize: Number.parseFloat(attributes['font-size'] ?? classFontSize),
    };
  });
}

function normalizeHex(color) {
  const normalized = color.toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(normalized)) return normalized;
  if (/^#[0-9a-f]{3}$/.test(normalized)) {
    return `#${[...normalized.slice(1)].map((value) => value.repeat(2)).join('')}`;
  }
  throw new Error(`Unsupported contrast color: ${color}`);
}

function resolveColor(token, styles) {
  return normalizeHex(token.startsWith('#') ? token : styles[token]?.fill ?? '');
}

function luminance(color) {
  const hex = normalizeHex(color).slice(1);
  return [0, 2, 4]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((component) =>
      component <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, component, index) => sum + component * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}

function contrast(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (light + 0.05) / (dark + 0.05);
}

function numberAttribute(attributes, name) {
  return Number.parseFloat(attributes[name]);
}

function verifyFourWayGeometry(file, svg, textNodes, errors) {
  const rectangles = parseTags(svg, 'rect');
  const paths = parseTags(svg, 'path');
  const requiredRectangles = ['time-wait', 'active-closed', 'peer-closed'];
  const boxes = Object.fromEntries(
    requiredRectangles.map((name) => [
      name,
      rectangles.find((attributes) => attributes['data-geometry'] === name),
    ]),
  );

  for (const [name, attributes] of Object.entries(boxes)) {
    if (!attributes) errors.push(`${file}: missing data-geometry="${name}" rectangle`);
  }

  const finalAck = paths.find((attributes) => attributes['data-message'] === 'final-ack');
  if (!finalAck) errors.push(`${file}: missing final ACK geometry marker`);
  if (Object.values(boxes).some((attributes) => !attributes) || !finalAck) return;

  const geometry = Object.fromEntries(
    Object.entries(boxes).map(([name, attributes]) => [
      name,
      Object.fromEntries(['x', 'y', 'width', 'height'].map((key) => [key, numberAttribute(attributes, key)])),
    ]),
  );
  const finalAckY = Number.parseFloat(finalAck.d.match(/^M[\d.]+[ ,]([\d.]+)/)?.[1]);
  const timeWaitBottom = geometry['time-wait'].y + geometry['time-wait'].height;

  if (!Number.isFinite(finalAckY)) errors.push(`${file}: final ACK path must start with an absolute M x y`);
  if (!(finalAckY < geometry['time-wait'].y)) {
    errors.push(`${file}: TIME_WAIT must begin below the final ACK line`);
  }
  if (!(timeWaitBottom <= geometry['active-closed'].y)) {
    errors.push(`${file}: active CLOSED must not overlap TIME_WAIT`);
  }
  if (!(finalAckY < geometry['peer-closed'].y)) {
    errors.push(`${file}: peer CLOSED must begin below the final ACK line`);
  }

  for (const [name, box] of Object.entries(geometry)) {
    if ([box.x, box.y, box.width, box.height].some((value) => !Number.isFinite(value))) {
      errors.push(`${file}: ${name} geometry must use numeric x/y/width/height attributes`);
      continue;
    }
    if (box.x < 0 || box.y < 0 || box.x + box.width > 1200 || box.y + box.height > 720) {
      errors.push(`${file}: ${name} rectangle exceeds the 1200×720 canvas`);
    }
    const label = textNodes.find((node) => node.attributes['data-geometry-label'] === name);
    if (!label) {
      errors.push(`${file}: missing data-geometry-label="${name}" text`);
      continue;
    }
    const labelX = numberAttribute(label.attributes, 'x');
    const labelY = numberAttribute(label.attributes, 'y');
    if (!(labelX >= box.x && labelX <= box.x + box.width && labelY > box.y && labelY <= box.y + box.height)) {
      errors.push(`${file}: ${name} label baseline must be inside its rectangle`);
    }
  }
}

const errors = [];

for (const [file, contract] of Object.entries(contracts)) {
  const svg = await readFile(file, 'utf8');
  const rootAttributes = parseAttributes(svg.match(/<svg\b([^>]*)>/)?.[1] ?? '');
  const styles = parseStyle(svg);
  const textNodes = parseText(svg, styles);

  if (rootAttributes.viewBox !== requiredViewBox) {
    errors.push(`${file}: expected viewBox="${requiredViewBox}", got "${rootAttributes.viewBox}"`);
  }
  if (Object.keys(contract.labels).length === 0) {
    errors.push(`${file}: required-label contract must not be empty`);
  }
  if (textNodes.length === 0) {
    errors.push(`${file}: contains no rendered text labels`);
  }

  const actualCounts = textNodes.reduce((counts, { content }) => {
    counts[content] = (counts[content] ?? 0) + 1;
    return counts;
  }, {});
  for (const [label, expectedCount] of Object.entries(contract.labels)) {
    const actualCount = actualCounts[label] ?? 0;
    if (actualCount !== expectedCount) {
      errors.push(`${file}: required label "${label}" expected ${expectedCount}, found ${actualCount}`);
    }
  }

  for (const { content, fontSize } of textNodes) {
    if (!Number.isFinite(fontSize)) {
      errors.push(`${file}: essential label "${content}" has no numeric font size`);
    } else if (fontSize < minimumEssentialFontSize) {
      errors.push(
        `${file}: essential label "${content}" is ${fontSize} viewBox units, below ${minimumEssentialFontSize}`,
      );
    }
  }

  const contrastRatios = contract.contrastPairs.map(([foregroundToken, backgroundToken]) => {
    try {
      const ratio = contrast(resolveColor(foregroundToken, styles), resolveColor(backgroundToken, styles));
      if (ratio < requiredContrast) {
        errors.push(
          `${file}: ${foregroundToken}/${backgroundToken} contrast is ${ratio.toFixed(2)}:1, below ${requiredContrast}:1`,
        );
      }
      return ratio;
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
      return 0;
    }
  });

  if (contract.verifyGeometry) verifyFourWayGeometry(file, svg, textNodes, errors);

  const numericFontSizes = textNodes.map(({ fontSize }) => fontSize).filter(Number.isFinite);
  const minimumFontSize = numericFontSizes.length > 0 ? Math.min(...numericFontSizes) : 0;
  const minimumContrast = contrastRatios.length > 0 ? Math.min(...contrastRatios) : 0;
  console.log(
    `${file}: ${textNodes.length} text labels, minimum ${minimumFontSize} units (${(
      (minimumFontSize * 320) /
      1200
    ).toFixed(2)} CSS px at 320px), contrast >= ${minimumContrast.toFixed(2)}:1`,
  );
}

if (errors.length > 0) {
  console.error(`TCP diagram verification failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${Object.keys(contracts).length} TCP diagrams: exact 1200×720 viewBox, explicit label counts, essential text >= ${minimumEssentialFontSize} units (11.20 CSS px at 320px), contrast >= ${requiredContrast}:1, and close-state geometry.`,
  );
}
