import { describe, expect, it } from 'vitest';
import browserMicromatch from '../src/lib/browser-micromatch';

describe('browser graph glob matching', () => {
  it('matches the graph plugin default recursive pattern', () => {
    expect(browserMicromatch.isMatch('projects/developer-hub', '**/*')).toBe(true);
  });

  it('matches a scoped recursive pattern without leaking to other sections', () => {
    expect(browserMicromatch.isMatch('projects/developer-hub', 'projects/**')).toBe(true);
    expect(browserMicromatch.isMatch('study/http-cache-control', 'projects/**')).toBe(false);
  });

  it('supports exact page patterns', () => {
    expect(browserMicromatch.isMatch('about', 'about')).toBe(true);
    expect(browserMicromatch.isMatch('about/team', 'about')).toBe(false);
  });
});
