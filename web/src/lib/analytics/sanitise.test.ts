import { describe, expect, it } from 'vitest';

import { sanitiseError, sanitiseProps } from './sanitise';

describe('sanitiseProps', () => {
  it('drops values that could identify a person or place', () => {
    expect(
      sanitiseProps({
        a: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
        b: 'https://pds.example.com/xrpc',
        c: 'alice.bsky.social',
        d: '@alice.bsky.social',
        e: 'me@example.com',
        f: 'button',
        g: 3,
        h: true,
      })
    ).toEqual({ f: 'button', g: 3, h: true });
  });
});

describe('sanitiseError', () => {
  it('redacts DIDs, URLs, emails and handles from the message', () => {
    expect(
      sanitiseError(
        new Error(
          'failed for did:plc:abc123 at https://pds.x/xrpc (me@x.com, alice.bsky.social)'
        )
      )
    ).toEqual({
      name: 'Error',
      message: 'failed for [redacted] at [redacted] ([redacted], [redacted])',
    });
  });

  it('keeps the error class name', () => {
    expect(sanitiseError(new TypeError('Failed to fetch'))).toEqual({
      name: 'TypeError',
      message: 'Failed to fetch',
    });
  });

  it('handles values that are not errors', () => {
    expect(sanitiseError('lost did:plc:abc')).toEqual({
      name: 'Error',
      message: 'lost [redacted]',
    });
    expect(sanitiseError(undefined)).toEqual({
      name: 'Error',
      message: 'Unknown error',
    });
  });
});
