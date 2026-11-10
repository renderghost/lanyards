import type { CaptureResult } from 'posthog-js';
import posthog from 'posthog-js';
import { afterEach, describe, expect, it } from 'vitest';

import { posthogOptions, scrubEvent } from './analytics';

const HOST = 'https://eu.i.posthog.com';

// Real posthog-js (not a mock): events pass through the app's scrubber and
// then a probe that records them and stops them being sent.
function capturedWith(setup: () => void): CaptureResult {
  setup();
  const seen: CaptureResult[] = [];
  const instance = posthog.init(
    'phc_test',
    {
      ...posthogOptions(HOST),
      before_send: [
        scrubEvent,
        (event) => {
          if (event) seen.push(event);
          return null;
        },
      ],
    },
    `privacy-${Math.random()}`
  );
  instance?.capture('sign_in_failed', { reason: 'denied' });
  const event = seen.find((e) => e.event === 'sign_in_failed');
  if (!event) throw new Error('event was not captured');
  return event;
}

const LEAKY =
  /^\$(current_url|pathname|host|referrer|referring_domain|session_entry_|initial_)/;

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('PostHog privacy', () => {
  it('sends no URL, path, host or referrer, even on the OAuth callback', () => {
    const event = capturedWith(() => {
      window.history.replaceState(
        null,
        '',
        '/oauth/callback#code=abc&state=xyz&iss=https%3A%2F%2Fpds.alice.example'
      );
      Object.defineProperty(document, 'referrer', {
        value: 'https://pds.alice.example/oauth/authorize',
        configurable: true,
      });
    });
    const leaked = Object.keys(event.properties ?? {}).filter((key) =>
      LEAKY.test(key)
    );
    expect(leaked).toEqual([]);
    expect(JSON.stringify(event)).not.toContain('pds.alice.example');
    expect(JSON.stringify(event)).not.toContain('code=abc');
    expect(event.properties?.reason).toBe('denied');
  });

  it('turns off remote features that could widen collection', () => {
    expect(posthogOptions(HOST)).toMatchObject({
      save_referrer: false,
      disable_capture_url_hashes: true,
      capture_exceptions: false,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      disable_web_experiments: true,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      capture_performance: false,
      rageclick: false,
    });
  });
});
