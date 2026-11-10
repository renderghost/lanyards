import posthog from 'posthog-js';

import type { AnalyticsEvent, AnalyticsProps } from './events';
import { sanitiseError, sanitiseProps } from './sanitise';

let enabled = false;

/**
 * Starts anonymous, cookieless analytics. Stays off (returns false) without a
 * project key or when the browser asks not to be tracked.
 */
export function initAnalytics(options: {
  key: string | undefined;
  host: string;
  doNotTrack: boolean;
}): boolean {
  if (!options.key || options.doNotTrack) {
    enabled = false;
    return false;
  }
  posthog.init(options.key, {
    api_host: options.host,
    persistence: 'memory',
    person_profiles: 'never',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    respect_dnt: true,
  });
  enabled = true;
  return true;
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (!enabled) return;
  posthog.capture(event, props ? sanitiseProps(props) : undefined);
}

/** Reports an error without identifiers. Never throws. */
export function captureError(
  error: unknown,
  context: { source: string }
): void {
  if (!enabled) return;
  posthog.capture('app_error', {
    ...sanitiseError(error),
    source: context.source,
  });
}
