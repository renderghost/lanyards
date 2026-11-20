import type { Browser } from '@playwright/test';

import { expect, test } from './fixtures';
import { mockPerson } from './mocks';

/** Cold loads measured; the budget holds for their median. */
const RUNS = 3;

type Metrics = { lcp: number; cls: number };

/** One cold load, in a fresh context: no cache, no service worker. */
async function coldLoad(browser: Browser, baseURL: string): Promise<Metrics> {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  try {
    await mockPerson(page);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });

    await page.goto('/alice.test');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
    ).toBeVisible({ timeout: 15_000 });

    return await page.evaluate(
      () =>
        new Promise<Metrics>((resolve) => {
          let lcp = 0;
          let cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) lcp = entry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            })[]) {
              if (!entry.hadRecentInput) cls += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve({ lcp, cls }), 1000);
        })
    );
  } finally {
    await context.close();
  }
}

/**
 * Spec §2: LCP under 2.5 s on a mid-range phone over 4G, CLS under 0.1.
 * Lighthouse's mobile profile: 4× CPU slowdown, 150 ms RTT, 1.6 Mbps down.
 * One cold load on a shared machine swings by ±150 ms, so the budget is
 * held to the median of three; no load may shift the layout.
 */
test('the public lanyard meets its loading budget', async ({ browser }) => {
  test.slow();
  const baseURL = test.info().project.use.baseURL ?? '';
  const runs: Metrics[] = [];
  for (let run = 0; run < RUNS; run += 1) {
    runs.push(await coldLoad(browser, baseURL));
  }
  const lcps = runs.map((run) => run.lcp).sort((a, b) => a - b);
  const median = lcps[Math.floor(RUNS / 2)]!;
  expect(lcps[0]).toBeGreaterThan(0);
  expect(median, `LCPs ${lcps.join(', ')} ms`).toBeLessThan(2500);
  for (const run of runs) expect(run.cls).toBeLessThan(0.1);
});
