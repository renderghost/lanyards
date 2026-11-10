import type { PostHog } from 'posthog-js';

import type { AnalyticsEvent, AnalyticsProps } from './events';
import { sanitiseError, sanitiseProps } from './sanitise';

export const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

/** Events kept while PostHog loads; older ones beyond this are dropped. */
const MAX_BUFFERED = 50;

type Captured = { event: string; props: AnalyticsProps | undefined };

let client: PostHog | null = null;
let loading = false;
let buffer: Captured[] = [];

/**
 * Starts anonymous, cookieless analytics, loading PostHog on demand so it
 * costs nothing when off. Resolves false without a project key or when the
 * browser asks not to be tracked.
 */
export async function initAnalytics(options: {
  key: string | undefined;
  host: string;
  doNotTrack: boolean;
}): Promise<boolean> {
  if (!options.key || options.doNotTrack) return false;
  loading = true;
  const { default: posthog } = await import('posthog-js');
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
  client = posthog;
  loading = false;
  for (const { event, props } of buffer) client.capture(event, props);
  buffer = [];
  return true;
}

function send(event: string, props: AnalyticsProps | undefined): void {
  if (client) {
    client.capture(event, props);
  } else if (loading) {
    buffer = [...buffer, { event, props }].slice(-MAX_BUFFERED);
  }
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  send(event, props ? sanitiseProps(props) : undefined);
}

/** Reports an error without identifiers. Never throws. */
export function captureError(
  error: unknown,
  context: { source: string }
): void {
  send('app_error', { ...sanitiseError(error), source: context.source });
}

/** True when the browser sends Do Not Track or Global Privacy Control. */
export function browserDoNotTrack(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}
