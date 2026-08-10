import { describe, expect, it } from 'vitest';
import { findComponentOverrideWarnings } from '../scripts/lib/build-log.mjs';

describe('build warning gate', () => {
  it('rejects duplicate Starlight component overrides', () => {
    const log = [
      'It looks like you already have a `ThemeSelect` component override in your Starlight configuration.',
      'Build completed.',
    ].join('\n');

    expect(findComponentOverrideWarnings(log)).toEqual([
      'It looks like you already have a `ThemeSelect` component override in your Starlight configuration.',
    ]);
  });

  it('accepts a clean Rapide and Blog build log', () => {
    expect(findComponentOverrideWarnings('25 pages built\nComplete!')).toEqual([]);
  });
});
