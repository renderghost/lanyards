import type { CaptureResult, PostHog, PostHogConfig } from 'posthog-js';

import type { AnalyticsEvent, AnalyticsProps } from './events';
import { sanitiseError, sanitiseProps } from './sanitise';

export const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

/** Events kept while PostHog loads; older ones beyond this are dropped. */
const MAX_BUFFERED = 50;

type Captured = { event: string; props: AnalyticsProps | undefined };

// Properties PostHog adds by itself that can carry URLs, OAuth parameters,
// handles in paths, or a self-hosted PDS host. Spec §14: none may be sent.
const LEAKY_PROPERTY =
  /^\$(current_url|pathname|host|referrer|referring_domain|session_entry_|initial_)/;

const withoutLeaks = (properties: Record<string, unknown> | undefined) =>
  properties &&
  Object.fromEntries(
    Object.entries(properties).filter(([key]) => !LEAKY_PROPERTY.test(key))
  );

/** Strips every URL-bearing property PostHog attaches automatically. */
export function scrubEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return null;
  return {
    ...event,
    properties: withoutLeaks(event.properties) ?? {},
    ...(event.$set ? { $set: withoutLeaks(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: withoutLeaks(event.$set_once) } : {}),
  };
}

/**
 * Anonymous, cookieless and locked down: nothing the PostHog dashboard can
 * switch on later (exception autocapture, surveys, remote scripts, flags)
 * may widen what is collected.
 */
export function posthogOptions(host: string): Partial<PostHogConfig> {
  return {
    api_host: host,
    persistence: 'memory',
    person_profiles: 'never',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    respect_dnt: true,
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
    before_send: scrubEvent,
  };
}

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
  posthog.init(options.key, posthogOptions(options.host));
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
