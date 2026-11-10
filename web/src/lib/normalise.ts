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
