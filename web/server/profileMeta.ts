import type { PageMeta } from './html.ts';

const PUBLIC_APPVIEW = 'https://public.api.bsky.app';
const SIFA_APPVIEW = 'https://sifa.id';
/** Link-preview fetchers wait a few seconds at most; Bluesky's included. */
export const UPSTREAM_TIMEOUT_MS = 1500;
const DESCRIPTION_MAX = 200;
const NO_UNAUTHENTICATED = '!no-unauthenticated';

export type PreviewProfile = {
  did: string;
  handle: string;
  displayName: string;
  headline?: string;
  avatar?: string;
};

type Profile = {
  did?: unknown;
  handle?: unknown;
  displayName?: unknown;
  description?: unknown;
  avatar?: unknown;
  labels?: { val?: unknown }[];
};

const graphemes = new Intl.Segmenter('en-GB', { granularity: 'grapheme' });

function truncate(text: string, max: number): string {
  const parts = [...graphemes.segment(text)];
  return parts.length <= max
    ? text
    : `${parts
        .slice(0, max)
        .map((part) => part.segment)
        .join('')}…`;
}

async function getJson(
  url: string,
  fetchImpl: typeof fetch
): Promise<unknown | null> {
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/**
 * The public profile a link preview may show, or null when the person
 * doesn't exist, has opted out of logged-out viewing, or Bluesky is slow.
 */
export async function fetchPreviewProfile(
  input: { handle?: string; did?: string },
  fetchImpl: typeof fetch = fetch
): Promise<PreviewProfile | null> {
  const actor = input.did ?? input.handle;
  if (!actor) return null;
  const query = new URLSearchParams({ actor });
  const [profile, sifa] = (await Promise.all([
    getJson(
      `${PUBLIC_APPVIEW}/xrpc/app.bsky.actor.getProfile?${query}`,
      fetchImpl
    ),
    getJson(`${SIFA_APPVIEW}/xrpc/id.sifa.getProfileView?${query}`, fetchImpl),
  ])) as [Profile | null, { headline?: unknown } | null];

  const did = text(profile?.did);
  const handle = text(profile?.handle);
  if (!profile || !did || !handle) return null;
  if (profile.labels?.some((label) => label.val === NO_UNAUTHENTICATED)) {
    return null;
  }

  const bio = text(profile.description)
    ?.split(/\n\s*\n/)[0]
    ?.trim();
  const headline = text(sifa?.headline) ?? bio;
  const avatar = text(profile.avatar);
  return {
    did,
    handle,
    displayName: text(profile.displayName) ?? handle,
    ...(headline ? { headline: truncate(headline, DESCRIPTION_MAX) } : {}),
    ...(avatar ? { avatar } : {}),
  };
}

/** Page meta for someone's lanyard, or null to use the default meta. */
export async function fetchProfileMeta(
  input: { handle?: string; did?: string },
  base: string,
  fetchImpl: typeof fetch = fetch
): Promise<PageMeta | null> {
  const person = await fetchPreviewProfile(input, fetchImpl);
  if (!person) return null;
  return {
    title: `${person.displayName} (@${person.handle}) · Lanyards`,
    description:
      person.headline ?? `${person.displayName}'s conference lanyard`,
    canonical: `${base}/@${person.handle}`,
    image: `${base}/og/p/${person.did}.png`,
    imageAlt: `${person.displayName}'s lanyard`,
    type: 'profile',
  };
}
