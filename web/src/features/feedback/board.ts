import { USERINPUT_NSID } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';
import { listRecords } from '@/lib/atproto/pds';
import { ok, type Result } from '@/lib/sources/result';

import {
  BOARD_OWNER_DID,
  BOARDS_READ,
  USERINPUT_ORIGIN,
} from './feedback.constants';

/** Our feedback board on UserInput, as the form needs it. */
export type FeedbackBoard = {
  /** With `cid`, the strong reference a discussion points at. */
  uri: string;
  cid: string;
  name: string;
  /** What feedback may be filed under, e.g. Bug, Idea, Question. */
  tags: { value: string; label: string }[];
  /** The board's page on UserInput. */
  url: string;
};

type Space = {
  name: string;
  tags?: { value: string; label: string }[];
};

/** `at://did/collection/rkey` → [did, rkey]. */
const parts = (uri: string): [string, string] => {
  const [, , did = '', , rkey = ''] = uri.split('/');
  return [did, rkey];
};

/** A post's page on UserInput. */
export function discussionUrl(uri: string): string {
  const [did, rkey] = parts(uri);
  return `${USERINPUT_ORIGIN}/d/${did}/${rkey}`;
}

/**
 * Our board: the newest valid `app.userinput.space` in @lanyards.app's
 * repository, or null when there is none yet (#134).
 */
export async function fetchFeedbackBoard(
  signal?: AbortSignal
): Promise<Result<FeedbackBoard | null>> {
  const spaces = await listRecords(
    'userinput',
    BOARD_OWNER_DID,
    USERINPUT_NSID.space,
    { limit: BOARDS_READ, ...(signal ? { signal } : {}) }
  );
  if (!spaces.ok) return spaces;

  const board = spaces.value.find(
    (record) => validateRecord(USERINPUT_NSID.space, record.value).ok
  );
  if (!board) return ok(null);
  const space = board.value as Space;
  const [did, rkey] = parts(board.uri);
  return ok({
    uri: board.uri,
    cid: board.cid,
    name: space.name,
    tags: (space.tags ?? []).map(({ value, label }) => ({ value, label })),
    url: `${USERINPUT_ORIGIN}/s/${did}/${rkey}`,
  });
}
