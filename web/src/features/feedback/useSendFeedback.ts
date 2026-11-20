import { useMutation } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session/useSession';
import { track } from '@/lib/analytics/analytics';
import { USERINPUT_NSID } from '@/lib/lexicons/nsids';
import {
  createRecord,
  MissingPermissionError,
  uploadBlob,
} from '@/lib/atproto/writes';
import { canSendFeedback, parseGrantedScope } from '@/lib/atproto/permissions';

import { discussionUrl, fetchFeedbackBoard } from './board';
import { feedbackBody } from './body';
import type { Screenshot } from './images';

/** What the person wrote, as the form hands it over. */
export type FeedbackDraft = {
  /** One of the board's tag values, or '' when the board has none. */
  type: string;
  title: string;
  details: string;
  screenshots: Screenshot[];
  /** Included only when the person ticked the box. */
  techDetails?: string;
};

export type SentFeedback = { uri: string; url: string };

/** Our board can't be read, or there is none: nothing can be sent. */
export class BoardUnavailableError extends Error {
  override name = 'BoardUnavailableError';
}

/**
 * Sends feedback to our UserInput board, from the person's own account
 * (#134): reads the board's current version, uploads each screenshot,
 * then posts the discussion. Nothing is posted if an upload fails.
 */
export function useSendFeedback() {
  const session = useSession();
  return useMutation({
    mutationFn: async (draft: FeedbackDraft): Promise<SentFeedback> => {
      if (session.status !== 'signedIn') {
        throw new MissingPermissionError('Not signed in');
      }
      const writer = session.session;
      if (!canSendFeedback(parseGrantedScope(writer.scope))) {
        throw new MissingPermissionError('No permission to send feedback');
      }
      const board = await fetchFeedbackBoard();
      if (!board.ok || !board.value) throw new BoardUnavailableError();

      const images = [];
      for (const shot of draft.screenshots) {
        images.push({
          alt: shot.alt.trim(),
          image: await uploadBlob(writer, shot.blob),
        });
      }
      const body = feedbackBody(draft.details, draft.techDetails);
      const { uri } = await createRecord(writer, USERINPUT_NSID.discussion, {
        space: { uri: board.value.uri, cid: board.value.cid },
        title: draft.title.trim(),
        ...(body ? { body } : {}),
        ...(draft.type ? { tags: [draft.type] } : {}),
        ...(images.length > 0 ? { images } : {}),
        createdAt: new Date().toISOString(),
      });
      track('feedback_sent', {
        screenshots: images.length,
        details: Boolean(draft.techDetails),
      });
      return { uri, url: discussionUrl(uri) };
    },
  });
}
