/**
 * Normalizes localhost to 127.0.0.1 for RFC 8252 compliance.
 * AT Protocol OAuth requires loopback IP addresses, not hostnames.
 *
 * @param url - URL string to normalize
 * @returns URL with localhost replaced by 127.0.0.1
 */
export function normalizeLocalhostTo127(url: string): string {
  let normalized = url;

  // Replace localhost with 127.0.0.1 in all common patterns
  normalized = normalized.replace('://localhost:', '://127.0.0.1:');
  normalized = normalized.replace('://localhost/', '://127.0.0.1/');

  // Handle URLs ending with ://localhost
  if (normalized.endsWith('://localhost')) {
    normalized = normalized.replace('://localhost', '://127.0.0.1');
  }

  return normalized;
}
