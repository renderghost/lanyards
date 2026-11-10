import { describe, expect, it } from 'vitest';

import { canCall, canWrite, parseGrantedScope } from './permissions';

const LANYARD = 'app.lanyards.actor.lanyard';
const WEB_LINK = 'app.lanyards.link.web';
const FOLLOW = 'app.bsky.graph.follow';
const LANYARDS_COLLECTIONS = [
  'app.lanyards.actor.lanyard',
  'app.lanyards.actor.biography.honorific',
  'app.lanyards.link.web',
  'app.lanyards.link.media.audio',
  'app.lanyards.link.media.video',
];
const ACTIONS = ['create', 'update', 'delete'] as const;

const writes = (scope: string, collection: string) =>
  ACTIONS.filter((action) =>
    canWrite(parseGrantedScope(scope), collection, action)
  );

describe('canWrite', () => {
  it('allows every write under transition:generic', () => {
    expect(writes('atproto transition:generic', LANYARD)).toEqual(ACTIONS);
    expect(writes('atproto transition:generic', FOLLOW)).toEqual(ACTIONS);
  });

  it('allows every write to any collection under repo:*', () => {
    expect(writes('atproto repo:*', 'com.example.anything')).toEqual(ACTIONS);
  });

  it('limits a positional repo scope to its collection and actions', () => {
    const scope =
      'atproto repo:app.bsky.graph.follow?action=create&action=delete';
    expect(writes(scope, FOLLOW)).toEqual(['create', 'delete']);
    expect(writes(scope, LANYARD)).toEqual([]);
  });

  it('allows all actions when a repo scope names collections only', () => {
    const scope = `atproto repo?collection=${LANYARD}&collection=${WEB_LINK}`;
    expect(writes(scope, LANYARD)).toEqual(ACTIONS);
    expect(writes(scope, WEB_LINK)).toEqual(ACTIONS);
    expect(writes(scope, FOLLOW)).toEqual([]);
  });

  it('expands the Lanyards permission set to its collections', () => {
    const granted = 'atproto include:app.lanyards.authFull';
    for (const collection of LANYARDS_COLLECTIONS) {
      expect(writes(granted, collection)).toEqual(ACTIONS);
    }
    expect(writes(granted, FOLLOW)).toEqual([]);
  });

  it('allows nothing under the identity-only atproto scope', () => {
    expect(writes('atproto', LANYARD)).toEqual([]);
    expect(writes('atproto', FOLLOW)).toEqual([]);
  });
});

describe('canCall', () => {
  const RELATIONSHIPS = 'app.bsky.graph.getRelationships';
  const FOLLOWERS = 'app.bsky.graph.getKnownFollowers';
  const AUD = 'aud=did:web:api.bsky.app%23bsky_appview';

  it('allows each method of a multi-method rpc scope', () => {
    const granted = parseGrantedScope(
      `atproto rpc?lxm=${RELATIONSHIPS}&lxm=${FOLLOWERS}&${AUD}`
    );
    expect(canCall(granted, RELATIONSHIPS)).toBe(true);
    expect(canCall(granted, FOLLOWERS)).toBe(true);
    expect(canCall(granted, 'app.bsky.actor.getPreferences')).toBe(false);
  });

  it('allows the method of a positional rpc scope', () => {
    const granted = parseGrantedScope(`atproto rpc:${RELATIONSHIPS}?${AUD}`);
    expect(canCall(granted, RELATIONSHIPS)).toBe(true);
    expect(canCall(granted, FOLLOWERS)).toBe(false);
  });

  it('allows any method under transition:generic', () => {
    const granted = parseGrantedScope('atproto transition:generic');
    expect(canCall(granted, RELATIONSHIPS)).toBe(true);
  });

  it('allows nothing under the identity-only atproto scope', () => {
    expect(canCall(parseGrantedScope('atproto'), RELATIONSHIPS)).toBe(false);
  });
});

describe('parseGrantedScope', () => {
  it('grants nothing for malformed tokens and never throws', () => {
    const granted = parseGrantedScope('repo: rpc?aud=x repo?action=create ::');
    expect(writes('repo: rpc?aud=x repo?action=create ::', FOLLOW)).toEqual([]);
    expect(canCall(granted, 'app.bsky.graph.getRelationships')).toBe(false);
  });
});
