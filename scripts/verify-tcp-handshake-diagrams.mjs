import { readFile } from 'node:fs/promises';

const svgFiles = [
  'public/images/study/network/tcp/tcp-three-way-handshake.svg',
  'public/images/study/network/tcp/tcp-four-way-handshake-time-wait.svg',
];
const mobileWidth = 320;
const requiredContrast = 4.5;
const requiredCriticalFontSize = 11;
const criticalText = /^(?:CLOSED|LISTEN|SYN_SENT|SYN_RECEIVED|ESTABLISHED|FIN_WAIT_1|FIN_WAIT_2|CLOSE_WAIT|LAST_ACK|TIME_WAIT|SYN|SYN-ACK|ACK|FIN|마지막 ACK)$/;
const isCriticalText = (text) => criticalText.test(text) || /(?:^|\s)seq=|(?:^|\s)ack=/.test(text);

function parseStyle(svg) {
  return Object.fromEntries(
    [...svg.matchAll(/\.([\w-]+)\s*\{([^}]+)\}/g)].map(([, name, rules]) => [
      name,
      Object.fromEntries(
        [...rules.matchAll(/([\w-]+)\s*:\s*([^;}]+)/g)].map(
          ([, property, value]) => [property, value.trim()],
        ),
      ),
    ]),
  );
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255,
  );
}

function luminance(hex) {
  return hexToRgb(hex)
    .map((component) =>
      component <= 0.04045
        ? component / 12.92
        : ((component + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, component, index) =>
        sum + component * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}

function contrast(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (light + 0.05) / (dark + 0.05);
}

for (const file of svgFiles) {
  const svg = await readFile(file, 'utf8');
  const viewBoxWidth = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)?.[1]);
  const classes = parseStyle(svg);
  const scale = mobileWidth / viewBoxWidth;
  const criticalSizes = [...svg.matchAll(/<text([^>]*)>([^<]+)<\/text>/g)]
    .map(([, attributes, content]) => {
      const text = content.trim();
      const classNames = attributes.match(/class="([^"]+)"/)?.[1].split(' ') ?? [];
      const fontSize = Number(
        attributes.match(/font-size="(\d+)"/)?.[1] ??
          classNames
            .map((className) => classes[className]?.['font-size'])
            .find(Boolean)
            ?.replace('px', ''),
      );
      return { text, fontSize: fontSize * scale };
    })
    .filter(({ text }) => isCriticalText(text));
  const palettePairs = [
    ['blue', '#dbeafe'],
    ['green', '#dcfce7'],
    ['amber', '#fef3c7'],
  ].map(([className, background]) => ({
    pair: `${className}/${background}`,
    ratio: contrast(classes[className].fill, background),
  }));

  console.log(
    `${file}: critical mobile fonts ${criticalSizes
      .map(({ text, fontSize }) => `${text}=${fontSize.toFixed(2)}px`)
      .join(', ')}`,
  );
  console.log(
    `${file}: pastel contrast ${palettePairs
      .map(({ pair, ratio }) => `${pair}=${ratio.toFixed(2)}:1`)
      .join(', ')}`,
  );

  for (const { text, fontSize } of criticalSizes) {
    if (fontSize < requiredCriticalFontSize) {
      throw new Error(
        `${file}: ${text} is ${fontSize.toFixed(2)}px at ${mobileWidth}px, below ${requiredCriticalFontSize}px`,
      );
    }
  }
  for (const { pair, ratio } of palettePairs) {
    if (ratio < requiredContrast) {
      throw new Error(
        `${file}: ${pair} contrast is ${ratio.toFixed(2)}:1, below ${requiredContrast}:1`,
      );
    }
  }
}

console.log(
  `Verified critical state and sequence labels at >= ${requiredCriticalFontSize}px and pastel contrast at >= ${requiredContrast}:1.`,
);
