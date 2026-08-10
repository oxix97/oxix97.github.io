import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findComponentOverrideWarnings } from './lib/build-log.mjs';

const astroCli = fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url));
const child = spawn(astroCli, ['build'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: ['inherit', 'pipe', 'pipe'],
});

let log = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString();
    log += text;
    const destination = stream === child.stdout ? process.stdout : process.stderr;
    destination.write(text);
  });
}

const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', resolve);
});

if (exitCode !== 0) process.exit(exitCode ?? 1);

const warnings = findComponentOverrideWarnings(log);
if (warnings.length > 0) {
  console.error(`Duplicate Starlight component overrides detected:\n${warnings.join('\n')}`);
  process.exit(1);
}
