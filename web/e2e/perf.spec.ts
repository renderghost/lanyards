import { expect, test } from './fixtures';
import { mockPerson } from './mocks';

/**
 * Spec §2: LCP under 2.5 s on a mid-range phone over 4G, CLS under 0.1.
 * Lighthouse's mobile profile: 4× CPU slowdown, 150 ms RTT, 1.6 Mbps down.
 */
test('the public lanyard meets its loading budget', async ({ page }) => {
  test.slow();
  await mockPerson(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  await page.goto('/@alice.test');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
  ).toBeVisible({ timeout: 15_000 });

  const metrics = await page.evaluate(
    () =>
      new Promise<{ lcp: number; cls: number }>((resolve) => {
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
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.cls).toBeLessThan(0.1);
});
