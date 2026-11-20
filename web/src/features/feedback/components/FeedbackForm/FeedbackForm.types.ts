import type { FeedbackBoard } from '../../board';
import type { Screenshot } from '../../images';
import type { SentFeedback } from '../../useSendFeedback';

export type FeedbackValues = {
  /** One of the board's tag values. */
  type: string;
  title: string;
  details: string;
  /** Include the technical details, shown in full first. */
  techDetails: boolean;
  screenshots: Screenshot[];
};

export type FeedbackErrors = {
  type?: 'required';
  title?: 'required' | 'tooLong';
  details?: 'tooLong';
};

export type FeedbackFormProps = {
  board: FeedbackBoard;
  /** Where the person was, for the technical details. */
  page: string;
  onSent(sent: SentFeedback): void;
  /** Sending needs permission the session doesn't have. */
  onNeedsPermission(): void;
  /** Captures the screen, hiding the dialog first; desktop only. */
  capture?: () => Promise<Blob>;
  className?: string;
};
