import type { FeedbackBoard } from '../../board';

export type ContactLinksProps = {
  /** Our board, null when there's none yet, undefined while it loads. */
  board: FeedbackBoard | null | undefined;
  className?: string;
};
