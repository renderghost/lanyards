import type {} from '@atcute/bluesky';
import { AppBskyActorDefs } from '@atcute/bluesky';
import type { Client } from '@atcute/client';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import { is } from '@atcute/lexicons/validations';

import { avatarThumbnail } from '@/lib/atproto/avatar';
import { PUBLIC_APPVIEW } from '@/lib/atproto/endpoints';
import { requestJson, requestXrpc } from '@/lib/sources/request';
import { err, ok, type Result } from '@/lib/sources/result';

import type {
  BlueskyProfile,
  BskyPost,
  Facet,
  KnownFollower,
  KnownFollowers,
  Relationship,
} from './bluesky.types';

const UNAVAILABLE = new Set([
  'AccountTakedown',
  'AccountDeactivated',
  'AccountSuspended',
]);
const MAX_FEED_REQUEST = 30;
const KNOWN_FOLLOWERS_LIMIT = 50;
const SAMPLE_SIZE = 2;

const xrpc = (method: string, params: Record<string, string>) =>
  `${PUBLIC_APPVIEW}/xrpc/${method}?${new URLSearchParams(params)}`;

/** The public Bluesky profile of a DID or handle. */
export async function fetchProfile(
  actor: ActorIdentifier | string,
  signal?: AbortSignal
): Promise<Result<BlueskyProfile>> {
  const response = await requestJson(
    'bluesky',
    xrpc('app.bsky.actor.getProfile', { actor }),
    signal
  );
  if (!response.ok) {
    const { code, status } = response.error;
    if (code && UNAVAILABLE.has(code)) {
      return err('bluesky', 'unavailable', { status, code });
    }
    if (code === 'InvalidRequest') {
      return err('bluesky', 'notFound', { status, code });
    }
    return response;
  }

  const profile = response.value;
  if (!is(AppBskyActorDefs.profileViewDetailedSchema, profile)) {
    return err('bluesky', 'invalid');
  }
  return ok({
    did: profile.did,
    handle: profile.handle,
    ...(profile.displayName ? { displayName: profile.displayName } : {}),
    ...(profile.description ? { description: profile.description } : {}),
    ...(profile.pronouns ? { pronouns: profile.pronouns } : {}),
    ...(profile.avatar ? { avatar: avatarThumbnail(profile.avatar) } : {}),
    links: (profile.links ?? []).map((link) => ({
      key: link.uri,
      url: link.url,
      ...(link.title ? { title: link.title } : {}),
      ...(link.icon ? { iconUrl: link.icon } : {}),
    })),
    labels: (profile.labels ?? []).map((label) => label.val),
  });
}

type FeedItem = {
  reason?: unknown;
  post?: {
    uri?: unknown;
    author?: { did?: unknown };
    record?: { text?: unknown; createdAt?: unknown; facets?: unknown };
  };
};

/** The person's latest posts: no replies, no reposts. */
export async function fetchPosts(
  did: Did,
  limit: number,
  signal?: AbortSignal
): Promise<Result<BskyPost[]>> {
  const response = await requestJson(
    'bluesky',
    xrpc('app.bsky.feed.getAuthorFeed', {
      actor: did,
      filter: 'posts_no_replies',
      limit: String(Math.min(limit * 2, MAX_FEED_REQUEST)),
    }),
    signal
  );
  if (!response.ok) return response;
  const feed = (response.value as { feed?: unknown }).feed;
  if (!Array.isArray(feed)) return err('bluesky', 'invalid');

  const posts: BskyPost[] = [];
  for (const item of feed as FeedItem[]) {
    const post = item.post;
    const record = post?.record;
    if (item.reason || post?.author?.did !== did) continue;
    if (typeof post.uri !== 'string' || typeof record?.text !== 'string') {
      continue;
    }
    if (typeof record.createdAt !== 'string') continue;
    const rkey = post.uri.split('/').pop();
    posts.push({
      key: post.uri,
      url: `https://bsky.app/profile/${did}/post/${rkey}`,
      text: record.text,
      ...(Array.isArray(record.facets)
        ? { facets: record.facets as Facet[] }
        : {}),
      createdAt: record.createdAt,
    });
  }
  return ok(posts.slice(0, limit));
}

type RelationshipView = {
  $type?: string;
  following?: string;
  followedBy?: string;
  blocking?: string;
  blockedBy?: string;
  blockingByList?: string;
  blockedByList?: string;
};

/** How the viewer and the subject relate: follows and blocks. */
export async function fetchRelationship(
  appview: Client,
  viewer: Did,
  subject: Did,
  signal?: AbortSignal
): Promise<Result<Relationship>> {
  const response = await requestXrpc<{ relationships?: RelationshipView[] }>(
    'bluesky',
    (abort) =>
      appview.get('app.bsky.graph.getRelationships', {
        params: { actor: viewer, others: [subject] },
        signal: abort,
      }),
    signal
  );
  if (!response.ok) return response;
  const view = response.value.relationships?.[0];
  if (!view || view.$type === 'app.bsky.graph.defs#notFoundActor') {
    return err('bluesky', 'notFound');
  }
  return ok({
    ...(view.following ? { followUri: view.following } : {}),
    followedBy: Boolean(view.followedBy),
    blocked: Boolean(
      view.blocking ||
      view.blockedBy ||
      view.blockingByList ||
      view.blockedByList
    ),
  });
}

/** People the viewer follows who also follow the subject. */
export async function fetchKnownFollowers(
  appview: Client,
  subject: Did,
  signal?: AbortSignal
): Promise<Result<KnownFollowers>> {
  const response = await requestXrpc<{
    followers?: KnownFollower[];
    cursor?: string;
  }>(
    'bluesky',
    (abort) =>
      appview.get('app.bsky.graph.getKnownFollowers', {
        params: { actor: subject, limit: KNOWN_FOLLOWERS_LIMIT },
        signal: abort,
      }),
    signal
  );
  if (!response.ok) return response;
  const followers = response.value.followers ?? [];
  return ok({
    sample: followers.slice(0, SAMPLE_SIZE).map((follower) => ({
      did: follower.did,
      handle: follower.handle,
      ...(follower.displayName ? { displayName: follower.displayName } : {}),
    })),
    count: followers.length,
    more: Boolean(response.value.cursor),
  });
}
