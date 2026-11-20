import { describe, expect, it } from 'vitest';

import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';
import type { SifaPosition, SifaProfile } from '@/lib/sources/sifa/sifa.types';
import { ADA } from '@/test/people';

import { coverFor } from '@/design/covers';

import { resolveConfig } from './config';
import { boardCells, composeHero, currentJob, heroName } from './hero';

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
  showHonorifics: true,
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
        honorificPrefix: 'Dr',
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
      config: resolveConfig(null),
    });
    expect(hero).toEqual({
      did: ADA.did,
      handle: 'alice.test',
      displayName: 'Ada Example',
      honorificPrefix: 'Dr',
      avatar: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/sifa@jpeg',
      pronouns: 'she/her',
      headline: 'Research Engineer',
      cover: coverFor(ADA.did),
      initials: 'AE',
      role: { title: 'Research Engineer', company: 'Example Lab', others: 0 },
      openTo: [],
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
      cover: coverFor(ADA.did),
      initials: 'AB',
      openTo: [],
    });
  });

  it('truncates a long bio headline to 200 graphemes', () => {
    const hero = composeHero({
      bluesky: { ...bluesky, description: 'x'.repeat(300) },
      config: resolveConfig(null),
    });
    expect(hero.headline).toBe(`${'x'.repeat(200)}…`);
  });

  it('only shows avatars from Bluesky’s image CDN', () => {
    const fromSifa = composeHero({
      bluesky,
      sifa: { ...emptySifa, avatar: 'https://tracker.example/ada.jpg' },
      config: resolveConfig(null),
    });
    expect(fromSifa.avatar).toBe(bluesky.avatar);

    for (const avatar of [
      'https://tracker.example/ada.jpg',
      'http://cdn.bsky.app/img/avatar_thumbnail/plain/bsky@jpeg',
      'https://cdn.bsky.app.tracker.example/ada.jpg',
    ]) {
      const hero = composeHero({
        bluesky: { ...bluesky, avatar },
        sifa: null,
        config: resolveConfig(null),
      });
      expect(hero.avatar).toBeUndefined();
    }
  });

  it('uses the handle when there is no display name anywhere', () => {
    const { displayName: _ignored, ...noName } = bluesky;
    expect(
      composeHero({ bluesky: noName, config: resolveConfig(null) }).displayName
    ).toBe('alice.test');
  });

  it('leaves out the role when the owner turned it off', () => {
    const hero = composeHero({
      bluesky,
      sifa: {
        ...emptySifa,
        positions: [position({ title: 'Engineer', startedAt: '2024' })],
      },
      config: { ...resolveConfig(null), showRole: false },
    });
    expect(hero.role).toBeUndefined();
    expect(hero).not.toHaveProperty('job');
  });

  it('keeps markup in names as plain text', () => {
    const hero = composeHero({
      bluesky: { ...bluesky, displayName: '<script>alert(1)</script>' },
      config: resolveConfig(null),
    });
    expect(hero.displayName).toBe('<script>alert(1)</script>');
  });
});

describe('the title from Sifa', () => {
  const config = resolveConfig(null);

  it('takes the title from Sifa, honouring its switch', () => {
    const shown = composeHero({
      bluesky,
      sifa: { ...emptySifa, honorificPrefix: 'Dr', honorificSuffix: 'PhD' },
      config,
    });
    expect(shown).toMatchObject({
      honorificPrefix: 'Dr',
      honorificSuffix: 'PhD',
    });
    const off = composeHero({
      bluesky,
      sifa: {
        ...emptySifa,
        honorificPrefix: 'Dr',
        honorificSuffix: 'PhD',
        showHonorifics: false,
      },
      config,
    });
    expect(off).not.toHaveProperty('honorificPrefix');
    expect(off).not.toHaveProperty('honorificSuffix');
    const noSifa = composeHero({ bluesky, sifa: null, config });
    expect(noSifa).not.toHaveProperty('honorificPrefix');
    expect(noSifa).not.toHaveProperty('honorificSuffix');
  });

  it('heroName puts the prefix before the name and the suffix after a comma', () => {
    expect(
      heroName({ displayName: 'Ada Example', honorificPrefix: 'Dr' })
    ).toBe('Dr Ada Example');
    expect(
      heroName({ displayName: 'Ada Example', honorificSuffix: 'PhD' })
    ).toBe('Ada Example, PhD');
    expect(
      heroName({
        displayName: 'Ada Example',
        honorificPrefix: 'Dr.',
        honorificSuffix: 'PhD',
      })
    ).toBe('Dr. Ada Example, PhD');
    expect(heroName({ displayName: 'Ada Example' })).toBe('Ada Example');
  });
});

describe('the departure board (#129)', () => {
  const primary = position({
    title: 'Primary',
    isPrimary: true,
    startedAt: '2020',
  });
  const latest = position({ title: 'Latest', startedAt: '2024-05' });
  const older = position({ title: 'Older', startedAt: '2022' });
  const ended = position({
    title: 'Ended',
    startedAt: '2010',
    endedAt: '2015',
  });
  const sifa: SifaProfile = {
    ...emptySifa,
    location: 'Berlin',
    openTo: ['speakingEngagements', 'mentoringOthers', 'collaborations'],
    positions: [primary, latest, older, ended],
  };
  const hero = (config = resolveConfig(null)) =>
    composeHero({ bluesky, sifa, config });

  it('shows the main current role and counts the other current ones', () => {
    expect(hero().role).toEqual({ title: 'Primary', others: 2 });
  });

  it('skips a hidden primary role for the next visible one', () => {
    const config = { ...resolveConfig(null), hidden: [primary.key] };
    expect(hero(config).role).toEqual({ title: 'Latest', others: 1 });
  });

  it('shows the location and what they’re open to, minus hidden ones', () => {
    const config = {
      ...resolveConfig(null),
      hidden: ['openTo:mentoringOthers'],
    };
    expect(hero(config)).toMatchObject({
      location: 'Berlin',
      openTo: ['speakingEngagements', 'collaborations'],
    });
  });

  it('leaves out what the owner turned off', () => {
    const shown = hero({
      ...resolveConfig(null),
      showRole: false,
      showLocation: false,
      showOpenTo: false,
    });
    expect(shown.role).toBeUndefined();
    expect(shown.location).toBeUndefined();
    expect(shown.openTo).toEqual([]);
  });

  it('wears the owner’s cover, or the one their DID gives them', () => {
    expect(hero().cover).toBe(coverFor(ADA.did));
    expect(hero({ ...resolveConfig(null), cover: 'hazard' }).cover).toBe(
      'hazard'
    );
  });
});

describe('boardCells', () => {
  it('lists the board cells the badge settings show', () => {
    const config = resolveConfig(null);
    expect(boardCells(config)).toEqual(['now', 'based', 'openTo']);
    expect(
      boardCells({ ...config, showRole: false, showOpenTo: false })
    ).toEqual(['based']);
    expect(
      boardCells({
        ...config,
        showRole: false,
        showLocation: false,
        showOpenTo: false,
      })
    ).toEqual([]);
  });
});
