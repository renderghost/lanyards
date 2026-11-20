import type { Dispatch, SetStateAction } from 'react';

import type { FeedbackBoard } from '../../board';
import type { Screenshot } from '../../images';
import type { FeedbackDraft } from '../../useSendFeedback';

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
  /** The draft, held by the dialog so closing it loses nothing. */
  values: FeedbackValues;
  onChange: Dispatch<SetStateAction<FeedbackValues>>;
  /** Sending is under way: the button is busy and won't send again. */
  sending: boolean;
  /** Called with feedback that's ready to send. */
  onSend(draft: FeedbackDraft): void;
  /** Why the last send failed, said by the button. */
  failure?: string | null;
  /** Captures the screen, hiding the dialog first; desktop only. */
  capture?: () => Promise<Blob>;
  className?: string;
};
