import { defaultMeta, injectMeta } from './html.ts';
import { fetchProfileMeta } from './profileMeta.ts';

const FOUND_CACHE = 'public, s-maxage=600, stale-while-revalidate=86400';
const FALLBACK_CACHE = 'public, s-maxage=60';
const HANDLE = /^[a-z0-9.-]{3,253}$/i;
const DID = /^did:[a-z]+:[a-zA-Z0-9._:%-]{1,2048}$/;

type Options = {
  readIndex(): Promise<string>;
  fetchImpl?: typeof fetch;
  /** Overrides the request's own origin (e.g. https://lanyards.app). */
  baseUrl?: string;
};

/** The handle or DID asked for, from the rewrite's query or the path. */
function subject(url: URL): { handle?: string; did?: string } {
  const handle =
    url.searchParams.get('handle') ?? /^\/@([^/]+)$/.exec(url.pathname)?.[1];
  const did =
    url.searchParams.get('did') ?? /^\/d\/([^/]+)$/.exec(url.pathname)?.[1];
  const clean = (value?: string) =>
    value ? decodeURIComponent(value).trim() : undefined;
  const asHandle = clean(handle)?.toLowerCase();
  const asDid = clean(did);
  if (asDid && DID.test(asDid)) return { did: asDid };
  if (asHandle && HANDLE.test(asHandle)) return { handle: asHandle };
  return {};
}

/**
 * Serves the app's index.html for /@handle and /d/did with that person's
 * title, description and badge image, so link previews show who it is.
 * Anything unknown or failing gets the default meta, briefly cached.
 */
export function createMetaHandler(options: Options) {
  return async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const base = (options.baseUrl ?? url.origin).replace(/\/+$/, '');
    const [index, meta] = await Promise.all([
      options.readIndex(),
      (async () => {
        const wanted = subject(url);
        if (!wanted.did && !wanted.handle) return null;
        return fetchProfileMeta(wanted, base, options.fetchImpl).catch(
          () => null
        );
      })(),
    ]);
    return new Response(injectMeta(index, meta ?? defaultMeta(base)), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': meta ? FOUND_CACHE : FALLBACK_CACHE,
      },
    });
  };
}
