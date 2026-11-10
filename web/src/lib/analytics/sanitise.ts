import type { AnalyticsProps } from './events';

const REDACTED = '[redacted]';

// Order matters: URLs and emails contain domain-like text, so they go first.
const PATTERNS = [
  /[a-z][a-z0-9+.-]*:\/\/[^\s"'<>()]+/gi, // URLs
  /[^\s@()<>"',]+@[^\s@()<>"',]+\.[^\s@()<>"',]+/g, // emails
  /did:[a-z]+:[a-zA-Z0-9._:%-]+/g, // DIDs
  /@?\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/gi, // handles and other domains
];

const looksIdentifying = (value: string) =>
  PATTERNS.some((pattern) => new RegExp(pattern.source, 'i').test(value));

const redact = (text: string) =>
  PATTERNS.reduce((result, pattern) => result.replace(pattern, REDACTED), text);

/** Drops any string value that looks like a DID, URL, email or handle. */
export function sanitiseProps(props: AnalyticsProps): AnalyticsProps {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([, value]) => typeof value !== 'string' || !looksIdentifying(value)
    )
  );
}

/** An error's class name and message, with identifying values redacted. */
export function sanitiseError(error: unknown): {
  name: string;
  message: string;
} {
  if (error instanceof Error) {
    return { name: error.name, message: redact(error.message) };
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: redact(error) };
  }
  return { name: 'Error', message: 'Unknown error' };
}
