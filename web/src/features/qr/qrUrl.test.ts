import { describe, expect, it } from 'vitest';

import { ADA } from '@/test/people';

import { qrUrl } from './qrUrl';

describe('qrUrl', () => {
  it('points at the DID lanyard on this deployment', () => {
    const url = qrUrl(ADA.did);
    expect(url).toBe(`${import.meta.env.VITE_PUBLIC_BASE_URL}/d/${ADA.did}`);
    expect(url).toMatch(/^https?:\/\//);
  });
});
