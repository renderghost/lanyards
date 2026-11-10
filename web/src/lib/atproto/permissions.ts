import { AUTH_FULL_COLLECTIONS, LANYARDS_NSID } from '@/lib/lexicons/nsids';

export type RepoAction = 'create' | 'update' | 'delete';

const ALL_ACTIONS: readonly RepoAction[] = ['create', 'update', 'delete'];

/** What a session's granted OAuth scope allows. */
export type GrantedPermissions = {
  /** transition:generic: every repo write and every non-chat method. */
  generic: boolean;
  /** Collection NSID (or '*') → allowed actions. */
  repo: Map<string, Set<RepoAction>>;
  /** Method NSIDs (or '*') callable through the service proxy. */
  rpc: Set<string>;
};

const isAction = (value: string): value is RepoAction =>
  (ALL_ACTIONS as readonly string[]).includes(value);

type Token = { resource: string; positional?: string; params: URLSearchParams };

/** Splits `resource[:positional][?query]`; returns null when malformed. */
function parseToken(token: string): Token | null {
  const queryAt = token.indexOf('?');
  const head = queryAt === -1 ? token : token.slice(0, queryAt);
  const query = queryAt === -1 ? '' : token.slice(queryAt + 1);
  const colonAt = head.indexOf(':');
  const resource = colonAt === -1 ? head : head.slice(0, colonAt);
  const positional = colonAt === -1 ? undefined : head.slice(colonAt + 1);
  if (!resource || positional === '') return null;
  return { resource, positional, params: new URLSearchParams(query) };
}

function grantRepo(
  granted: GrantedPermissions,
  collections: readonly string[],
  actions: readonly RepoAction[]
): void {
  for (const collection of collections) {
    const allowed = granted.repo.get(collection) ?? new Set<RepoAction>();
    for (const action of actions) allowed.add(action);
    granted.repo.set(collection, allowed);
  }
}

/** Reads a space-separated OAuth scope string as granted by the server. */
export function parseGrantedScope(scope: string): GrantedPermissions {
  const granted: GrantedPermissions = {
    generic: false,
    repo: new Map(),
    rpc: new Set(),
  };

  for (const raw of scope.split(' ')) {
    const token = parseToken(raw.trim());
    if (!token) continue;
    const { resource, positional, params } = token;

    if (resource === 'transition' && positional === 'generic') {
      granted.generic = true;
    } else if (resource === 'repo') {
      const collections = positional
        ? [positional]
        : params.getAll('collection');
      const named = params.getAll('action').filter(isAction);
      grantRepo(granted, collections, named.length ? named : ALL_ACTIONS);
    } else if (resource === 'rpc') {
      if (!params.getAll('aud').length) continue;
      const methods = positional ? [positional] : params.getAll('lxm');
      for (const method of methods) granted.rpc.add(method);
    } else if (resource === 'include') {
      // Only our own permission set is expanded; others grant nothing here.
      const nsid = positional ?? params.get('nsid');
      if (nsid === LANYARDS_NSID.authFull) {
        grantRepo(granted, AUTH_FULL_COLLECTIONS, ALL_ACTIONS);
      }
    }
  }
  return granted;
}

export function canWrite(
  granted: GrantedPermissions,
  collection: string,
  action: RepoAction
): boolean {
  if (granted.generic) return true;
  return Boolean(
    granted.repo.get(collection)?.has(action) ||
    granted.repo.get('*')?.has(action)
  );
}

export function canCall(granted: GrantedPermissions, lxm: string): boolean {
  if (granted.generic && !lxm.startsWith('chat.bsky.')) return true;
  return granted.rpc.has(lxm) || granted.rpc.has('*');
}
