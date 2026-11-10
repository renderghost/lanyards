import { isDid, isHandle } from '@atcute/lexicons/syntax';

/** Problems shown inline under the handle field. */
export type SignInError = 'required' | 'email' | 'invalid' | 'notFound';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Trims the input and, for handles, strips one leading @ and lower-cases it.
 * DIDs are only trimmed because they are case-sensitive.
 */
export function normaliseIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('did:')) return trimmed;
  return trimmed.replace(/^@/, '').toLowerCase();
}

export function validateIdentifier(raw: string): SignInError | null {
  const value = normaliseIdentifier(raw);
  if (!value) return 'required';
  if (isDid(value) || isHandle(value)) return null;
  if (EMAIL.test(value)) return 'email';
  return 'invalid';
}
