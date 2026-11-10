import type { BadgeImageInput } from './badgeImage.tsx';
import { fetchPreviewProfile, UPSTREAM_TIMEOUT_MS } from './profileMeta.ts';

const IMAGE_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800';
const DID = /^did:[a-z]+:[a-zA-Z0-9._:%-]{1,2048}$/;
const MAX_AVATAR_BYTES = 1_000_000;

type Options = {
  render(input: BadgeImageInput | null): Promise<Uint8Array>;
  fetchImpl?: typeof fetch;
};

/** The small CDN variant, fetched as a data URI so satori never fetches. */
async function avatarDataUri(
  avatar: string | undefined,
  fetchImpl: typeof fetch
): Promise<string | undefined> {
  if (!avatar?.startsWith('https://cdn.bsky.app/img/avatar/')) return undefined;
  const url = avatar.replace('/img/avatar/', '/img/avatar_thumbnail/');
  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok || !type.startsWith('image/')) return undefined;
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
    const png = await options.render(input);
    return new Response(Uint8Array.from(png), {
      headers: { 'content-type': 'image/png', 'cache-control': IMAGE_CACHE },
    });
  };
}
