import { describe, expect, it } from 'vitest';

import { normaliseDoi, normaliseUrl, safeHref } from './normalise';

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

describe('normaliseUrl', () => {
  it('treats scheme, case, www, default ports, trailing slashes, fragments and tracking parameters as the same link', () => {
    expect(
      normaliseUrl('https://WWW.Example.com:443/a/?utm_source=x&b=1#top')
    ).toBe('https://example.com/a?b=1');
    expect(normaliseUrl('http://example.com/a/')).toBe('https://example.com/a');
    expect(normaliseUrl('https://example.com')).toBe('https://example.com/');
  });

  it('keeps the path’s case and meaningful query parameters', () => {
    expect(normaliseUrl('https://github.com/Ada-Example?tab=repos')).toBe(
      'https://github.com/Ada-Example?tab=repos'
    );
  });

  it.each(['javascript:alert(1)', 'mailto:ada@example.test', 'not a url'])(
    'rejects %s',
    (url) => {
      expect(normaliseUrl(url)).toBeNull();
    }
  );
});

describe('normaliseDoi', () => {
  it.each([
    ['10.1000/ABC', '10.1000/abc'],
    ['https://doi.org/10.1000/ABC', '10.1000/abc'],
    ['http://dx.doi.org/10.1000/abc', '10.1000/abc'],
    ['doi:10.1000/abc', '10.1000/abc'],
    ['  10.1000/abc  ', '10.1000/abc'],
  ])('normalises %s', (input, expected) => {
    expect(normaliseDoi(input)).toBe(expected);
  });

  it.each(['', 'abc', '11.1000/abc'])('rejects %s', (input) => {
    expect(normaliseDoi(input)).toBeNull();
  });
});
