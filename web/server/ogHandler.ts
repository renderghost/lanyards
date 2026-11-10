import type { BadgeImageInput } from './badgeImage.ts';
import { fetchPreviewProfile, UPSTREAM_TIMEOUT_MS } from './profileMeta.ts';

const IMAGE_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800';
/** When the default stands in for a person, so their badge appears soon. */
const STAND_IN_CACHE = 'public, s-maxage=60';
const DID = /^did:[a-z]+:[a-zA-Z0-9._:%-]{1,2048}$/;
const MAX_AVATAR_BYTES = 1_000_000;
/** Image types satori can draw; the CDN may otherwise send WebP. */
const DRAWABLE = new Set(['image/jpeg', 'image/png']);

type Options = {
  render(input: BadgeImageInput | null): Promise<Uint8Array>;
  fetchImpl?: typeof fetch;
};

/**
 * The small CDN variant as a JPEG, fetched as a data URI so satori never
 * fetches. Avatar URLs may name any format, or none (the CDN then sends
 * WebP), so the format is always set to JPEG.
 */
async function avatarDataUri(
  avatar: string | undefined,
  fetchImpl: typeof fetch
): Promise<string | undefined> {
  if (!avatar?.startsWith('https://cdn.bsky.app/img/avatar/')) return undefined;
  const url = `${avatar
    .replace('/img/avatar/', '/img/avatar_thumbnail/')
    .replace(/@[a-z]+$/, '')}@jpeg`;
  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const type =
      (response.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? '';
    if (!response.ok || !DRAWABLE.has(type)) return undefined;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_AVATAR_BYTES) return undefined;
    return `data:${type};base64,${Buffer.from(bytes).toString('base64')}`;
  } catch {
    return undefined;
  }
}

/** Serves the 1200×630 badge image for a person, or the default badge. */
export function createOgHandler(options: Options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  return async function GET(request: Request): Promise<Response> {
    const did = new URL(request.url).searchParams.get('did') ?? '';
    let input: BadgeImageInput | null = null;
    if (DID.test(did)) {
      const person = await fetchPreviewProfile({ did }, fetchImpl).catch(
        () => null
      );
      if (person) {
        const avatar = await avatarDataUri(person.avatar, fetchImpl);
        input = {
          displayName: person.displayName,
          handle: person.handle,
          ...(person.headline ? { headline: person.headline } : {}),
          ...(avatar ? { avatarDataUri: avatar } : {}),
        };
      }
    }
    let cache = input || !DID.test(did) ? IMAGE_CACHE : STAND_IN_CACHE;
    let png: Uint8Array;
    try {
      png = await options.render(input);
    } catch (error) {
      if (!input) return unavailable(error);
      console.error('Could not draw the badge image', error);
      try {
        png = await options.render(null);
        cache = STAND_IN_CACHE;
      } catch (fallbackError) {
        return unavailable(fallbackError);
      }
    }
    return new Response(Uint8Array.from(png), {
      headers: { 'content-type': 'image/png', 'cache-control': cache },
    });
  };
}

function unavailable(error: unknown): Response {
  console.error('Could not draw the default badge image', error);
  return new Response(null, {
    status: 503,
    headers: { 'cache-control': 'no-store' },
  });
}
