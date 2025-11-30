import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node';

import type { Database } from '@/lib/db';

export class StateStore implements NodeSavedStateStore {
  constructor(private db: Database) {}

  async get(key: string): Promise<NodeSavedState | undefined> {
    // console.log('[StateStore] get', key);
    const result = await this.db
      .selectFrom('auth_state')
      .selectAll()
      .where('key', '=', key)
      .executeTakeFirst();
    if (!result) return;
    return JSON.parse(result.state) as NodeSavedState;
  }

  async set(key: string, val: NodeSavedState) {
    // console.log('[StateStore] set', key);
    const state = JSON.stringify(val);
    await this.db
      .insertInto('auth_state')
      .values({ key, state })
      .onConflict((oc) => oc.doUpdateSet({ state }))
      .execute();
  }

  async del(key: string) {
    // console.log('[StateStore] del', key);
    await this.db.deleteFrom('auth_state').where('key', '=', key).execute();
  }
}

export class SessionStore implements NodeSavedSessionStore {
  constructor(private db: Database) {}

  async get(key: string): Promise<NodeSavedSession | undefined> {
    console.log('[SessionStore] get key:', key);
    const result = await this.db
      .selectFrom('auth_session')
      .selectAll()
      .where('key', '=', key)
      .executeTakeFirst();

    console.log('[SessionStore] get result found?', !!result);
    if (!result) return;
    return JSON.parse(result.session) as NodeSavedSession;
  }

  async set(key: string, val: NodeSavedSession) {
    console.log('[SessionStore] set key:', key);
    const session = JSON.stringify(val);
    await this.db
      .insertInto('auth_session')
      .values({ key, session })
      .onConflict((oc) => oc.doUpdateSet({ session }))
      .execute();
  }

  async del(key: string) {
    console.log('[SessionStore] del key:', key);
    await this.db.deleteFrom('auth_session').where('key', '=', key).execute();
  }
}
