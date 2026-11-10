import { describe, expect, it } from 'vitest';

import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';
import type { SifaPosition, SifaProfile } from '@/lib/sources/sifa/sifa.types';
import { ADA } from '@/test/people';

import { resolveConfig } from './config';
import { composeHero, currentJob } from './hero';

const bluesky: BlueskyProfile = {
  did: ADA.did,
  handle: 'alice.test',
  displayName: 'Ada (Bluesky)',
  description: 'First paragraph of the bio.\n\nSecond paragraph.',
  pronouns: 'they/them',
  avatar: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/bsky@jpeg',
  links: [],
  labels: [],
};

const emptySifa: SifaProfile = {
  langs: [],
  openTo: [],
  positions: [],
  education: [],
  skills: [],
  externalAccounts: [],
  publications: [],
  talks: [],
};

const position = (overrides: Partial<SifaPosition>): SifaPosition => ({
  key: `at://${ADA.did}/id.sifa.profile.position/${overrides.title ?? 'x'}`,
  title: 'Role',
  isPrimary: false,
  ...overrides,
});

describe('currentJob', () => {
  it('ignores positions that have ended', () => {
    expect(
      currentJob([
        position({ title: 'Old', startedAt: '2010', endedAt: '2012' }),
      ])
    ).toBeUndefined();
  });

  it('prefers the primary current position', () => {
    expect(
      currentJob([
        position({ title: 'Newest', startedAt: '2025-01' }),
        position({ title: 'Primary', startedAt: '2020-01', isPrimary: true }),
      ])?.title
    ).toBe('Primary');
  });

  it('otherwise takes the most recently started current position', () => {
    expect(
      currentJob([
        position({ title: 'Older', startedAt: '2019' }),
        position({ title: 'Newer', startedAt: '2024-03' }),
        position({ title: 'Ended', startedAt: '2025', endedAt: '2025-06' }),
      ])?.title
    ).toBe('Newer');
  });
});

describe('composeHero', () => {
  it('prefers Sifa’s name, avatar and pronouns, with the honorific and current job', () => {
    const hero = composeHero({
      bluesky,
      sifa: {
        ...emptySifa,
        displayName: 'Ada Example',
        avatar: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/sifa@jpeg',
        pronouns: 'she/her',
        headline: 'Research Engineer',
        positions: [
          position({
            title: 'Research Engineer',
            company: 'Example Lab',
            startedAt: '2024-03',
          }),
        ],
      },
      lanyards: { config: null, honorific: 'Dr', webLinks: [], media: [] },
      config: resolveConfig(null),
    });
    expect(hero).toEqual({
      did: ADA.did,
      handle: 'alice.test',
      displayName: 'Ada Example',
      honorific: 'Dr',
      avatar: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/sifa@jpeg',
      pronouns: 'she/her',
      headline: 'Research Engineer',
      job: { title: 'Research Engineer', company: 'Example Lab' },
    });
  });

  it('falls back to Bluesky, using the first paragraph of the bio as the headline', () => {
    const hero = composeHero({
      bluesky,
      sifa: null,
      config: resolveConfig(null),
    });
    expect(hero).toEqual({
      did: ADA.did,
      handle: 'alice.test',
      displayName: 'Ada (Bluesky)',
      avatar: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/bsky@jpeg',
      pronouns: 'they/them',
      headline: 'First paragraph of the bio.',
    });
  });

  it('truncates a long bio headline to 200 graphemes', () => {
    const hero = composeHero({
      bluesky: { ...bluesky, description: 'x'.repeat(300) },
      config: resolveConfig(null),
    });
    expect(hero.headline).toBe(`${'x'.repeat(200)}…`);
  });

  it('uses the handle when there is no display name anywhere', () => {
    const { displayName: _ignored, ...noName } = bluesky;
    expect(
      composeHero({ bluesky: noName, config: resolveConfig(null) }).displayName
    ).toBe('alice.test');
  });

  it('leaves out the job when the owner turned it off', () => {
    const hero = composeHero({
      bluesky,
      sifa: {
        ...emptySifa,
        positions: [position({ title: 'Engineer', startedAt: '2024' })],
      },
      config: { ...resolveConfig(null), showJob: false },
    });
    expect(hero.job).toBeUndefined();
  });

  it('keeps markup in names as plain text', () => {
    const hero = composeHero({
      bluesky: { ...bluesky, displayName: '<script>alert(1)</script>' },
      config: resolveConfig(null),
    });
    expect(hero.displayName).toBe('<script>alert(1)</script>');
  });
});
