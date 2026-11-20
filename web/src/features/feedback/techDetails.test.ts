import { afterEach, describe, expect, it, vi } from 'vitest';

import { browserOf, techDetails } from './techDetails';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('techDetails (#134)', () => {
  it('lists the app, browser, window and page, exactly', () => {
    vi.stubGlobal('innerWidth', 390);
    vi.stubGlobal('innerHeight', 844);
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    });
    expect(techDetails({ page: '/@alice.test' })).toBe(
      [
        `App: ${__APP_VERSION__}`,
        'Browser: Safari 18 on iOS',
        'Window: 390×844',
        'Page: /@alice.test',
      ].join('\n')
    );
  });

  it.each([
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Chrome 131 on macOS',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Edge 131 on Windows',
    ],
    [
      'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      'Firefox 133 on Linux',
    ],
    [
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      'Chrome 131 on Android',
    ],
    ['Something else entirely', 'Unknown browser'],
  ])('names the browser in %s', (agent, name) => {
    expect(browserOf(agent)).toBe(name);
  });
});
