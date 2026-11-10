import { describe, expect, it } from 'vitest';

import { safeHref } from './normalise';

describe('safeHref', () => {
  it.each([
    'https://example.com/a?b=c',
    'http://example.com',
    'mailto:ada@example.test',
  ])('keeps %s', (url) => {
    expect(safeHref(url)).toBe(url);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox',
    'ftp://example.com',
    '/relative/path',
    'not a url',
    '',
  ])('rejects %s', (url) => {
    expect(safeHref(url)).toBeUndefined();
  });
});
