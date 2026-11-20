import { useQuery } from '@tanstack/react-query';

import { sourceQueryOptions } from '@/lib/person/sourceQuery';

import { fetchFeedbackBoard } from './board';
import { BOARD_OWNER_DID } from './feedback.constants';

export const feedbackBoardKey = ['feedbackBoard', BOARD_OWNER_DID] as const;

/** Our feedback board, read live: null until it exists (#134). */
export function useFeedbackBoard() {
  return useQuery({
    queryKey: feedbackBoardKey,
    ...sourceQueryOptions('userinput', fetchFeedbackBoard),
  });
}
