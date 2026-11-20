import { createContext, useContext } from 'react';

export type FeedbackControls = {
  /**
   * Opens the feedback dialog; `returnFocus` puts focus back where the
   * person was once it closes.
   */
  show(returnFocus: () => void): void;
};

export const FeedbackContext = createContext<FeedbackControls | null>(null);

/** The app's one feedback dialog, from anywhere that offers it (#134). */
export function useFeedback(): FeedbackControls {
  const controls = useContext(FeedbackContext);
  if (!controls) throw new Error('useFeedback needs a FeedbackProvider');
  return controls;
}
