/**
 * URL and identifier helpers shared by the source adapters and PersonView.
 * Everything here is pure.
 */

const SAFE_SCHEMES = new Set(['https:', 'http:', 'mailto:']);

/**
 * Returns `url` only when it is an absolute https, http or mailto URL, so
 * record content can never smuggle `javascript:` or `data:` links into the
 * page.
 */
export function safeHref(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  return SAFE_SCHEMES.has(parsed.protocol) ? url : undefined;
}

const TRACKING_PARAM = /^utm_/i;
const DOI_PREFIX = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/i;

/**
 * A comparison key for a web link, so the same page from different sources
 * counts once: https, lower-case host without `www.`, no default port,
 * fragment, trailing slash or `utm_*` parameters. Never shown to people.
 * Returns null for anything that is not an http(s) URL.
 */
export function normaliseUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const port =
    parsed.port && parsed.port !== '80' && parsed.port !== '443'
      ? `:${parsed.port}`
      : '';
  const path =
    parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : '/';
  const params = new URLSearchParams(
    [...parsed.searchParams].filter(([key]) => !TRACKING_PARAM.test(key))
  );
  const search = params.toString();
  const query = search ? `?${search}` : '';
  return `https://${host}${port}${path}${query}`;
}

/** A bare, lower-case DOI (`10.x/…`), or null when `value` isn't one. */
export function normaliseDoi(value: string): string | null {
  const doi = value.trim().replace(DOI_PREFIX, '').toLowerCase();
  return doi.startsWith('10.') && doi.includes('/') ? doi : null;
}

/** A URL's host without "www.", to name a link with no title. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
