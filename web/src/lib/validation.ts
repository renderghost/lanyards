export type WebAddressError = 'required' | 'scheme';

/** A web address must be an http(s) URL with a host. */
export function validateWebAddress(raw: string): WebAddressError | null {
  const value = raw.trim();
  if (!value) return 'required';
  try {
    const url = new URL(value);
    const web = url.protocol === 'https:' || url.protocol === 'http:';
    return web && url.hostname ? null : 'scheme';
  } catch {
    return 'scheme';
  }
}

/** True when `value` exceeds a lexicon maxLength, which counts UTF-8 bytes. */
export function tooLong(value: string, maxBytes: number): boolean {
  return new TextEncoder().encode(value).length > maxBytes;
}

const characters = new Intl.Segmenter('en-GB', { granularity: 'grapheme' });

/**
 * `value` cut to the whole characters that fit a lexicon maxLength (UTF-8
 * bytes): the byte-counting version of an input's maxLength.
 */
export function fitBytes(value: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  if (encoder.encode(value).length <= maxBytes) return value;
  let kept = '';
  let bytes = 0;
  for (const { segment } of characters.segment(value)) {
    bytes += encoder.encode(segment).length;
    if (bytes > maxBytes) break;
    kept += segment;
  }
  return kept;
}
