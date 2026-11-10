import { beforeEach, describe, expect, it, vi } from 'vitest';

const posthog = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock('posthog-js', () => ({ default: posthog }));

const load = () => import('./analytics');

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

const HOST = 'https://eu.i.posthog.com';

describe('initAnalytics', () => {
  it('stays off without a project key', async () => {
    const { initAnalytics } = await load();
    await expect(
      initAnalytics({ key: undefined, host: HOST, doNotTrack: false })
    ).resolves.toBe(false);
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('stays off when the browser asks not to be tracked', async () => {
    const { initAnalytics } = await load();
    await expect(
      initAnalytics({ key: 'phc_x', host: HOST, doNotTrack: true })
    ).resolves.toBe(false);
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('starts PostHog cookieless, anonymous and without autocapture', async () => {
    const { initAnalytics } = await load();
    await expect(
      initAnalytics({ key: 'phc_x', host: HOST, doNotTrack: false })
    ).resolves.toBe(true);
    expect(posthog.init).toHaveBeenCalledWith(
      'phc_x',
      expect.objectContaining({
        api_host: HOST,
        persistence: 'memory',
        person_profiles: 'never',
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
        respect_dnt: true,
      })
    );
  });
});

describe('track', () => {
  it('does nothing before analytics starts', async () => {
    const { track } = await load();
    expect(() => track('app_opened')).not.toThrow();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('sends events with identifying values removed', async () => {
    const { initAnalytics, track } = await load();
    await initAnalytics({ key: 'phc_x', host: HOST, doNotTrack: false });
    track('sign_in_failed', { reason: 'denied', who: 'did:plc:abc' });
    expect(posthog.capture).toHaveBeenCalledWith('sign_in_failed', {
      reason: 'denied',
    });
  });

  it('buffers events sent while PostHog is still loading', async () => {
    const { initAnalytics, track } = await load();
    const ready = initAnalytics({
      key: 'phc_x',
      host: HOST,
      doNotTrack: false,
    });
    track('app_opened');
    expect(posthog.capture).not.toHaveBeenCalled();
    await ready;
    expect(posthog.capture).toHaveBeenCalledWith('app_opened', undefined);
  });
});

describe('captureError', () => {
  it('reports a sanitised error with its source', async () => {
    const { captureError, initAnalytics } = await load();
    await initAnalytics({ key: 'phc_x', host: HOST, doNotTrack: false });
    captureError(new Error('boom for did:plc:abc'), { source: 'route' });
    expect(posthog.capture).toHaveBeenCalledWith('app_error', {
      name: 'Error',
      message: 'boom for [redacted]',
      source: 'route',
    });
  });

  it('does nothing before analytics starts', async () => {
    const { captureError } = await load();
    captureError(new Error('boom'), { source: 'route' });
    expect(posthog.capture).not.toHaveBeenCalled();
  });
});

describe('browserDoNotTrack', () => {
  it('honours Do Not Track and Global Privacy Control', async () => {
    const { browserDoNotTrack } = await load();
    const set = (name: string, value: unknown) =>
      Object.defineProperty(navigator, name, { value, configurable: true });
    set('doNotTrack', '1');
    expect(browserDoNotTrack()).toBe(true);
    set('doNotTrack', '0');
    expect(browserDoNotTrack()).toBe(false);
    set('globalPrivacyControl', true);
    expect(browserDoNotTrack()).toBe(true);
    Reflect.deleteProperty(navigator, 'globalPrivacyControl');
    Reflect.deleteProperty(navigator, 'doNotTrack');
  });
});
