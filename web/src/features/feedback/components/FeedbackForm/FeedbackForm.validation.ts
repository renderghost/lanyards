import { tooLong } from '@/lib/validation';

import {
  DETAILS_MAX_BYTES,
  DETAILS_MAX_GRAPHEMES,
  TITLE_MAX_BYTES,
  TITLE_MAX_GRAPHEMES,
} from './FeedbackForm.constants';
import type { FeedbackErrors, FeedbackValues } from './FeedbackForm.types';

const graphemes = new Intl.Segmenter('en-GB', { granularity: 'grapheme' });

const longerThan = (value: string, maxGraphemes: number, maxBytes: number) =>
  tooLong(value, maxBytes) ||
  [...graphemes.segment(value)].length > maxGraphemes;

/** Problems with the feedback, by field; empty when it can be sent. */
export function validateFeedback(
  values: Pick<FeedbackValues, 'type' | 'title' | 'details'>,
  options: { needsType: boolean }
): FeedbackErrors {
  const errors: FeedbackErrors = {};
  if (options.needsType && !values.type) errors.type = 'required';
  const title = values.title.trim();
  if (!title) errors.title = 'required';
  else if (longerThan(title, TITLE_MAX_GRAPHEMES, TITLE_MAX_BYTES)) {
    errors.title = 'tooLong';
  }
  if (
    longerThan(values.details.trim(), DETAILS_MAX_GRAPHEMES, DETAILS_MAX_BYTES)
  ) {
    errors.details = 'tooLong';
  }
  return errors;
}
