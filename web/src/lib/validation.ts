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
