import { tooLong, validateWebAddress } from '@/lib/validation';

import { DESCRIPTION_MAX, TITLE_MAX } from './MediaForm.constants';
import type { MediaErrors, MediaValues } from './MediaForm.types';

/** Problems with a podcast or video, by field; empty when it can be saved. */
export function validateMedia(
  values: Pick<MediaValues, 'url' | 'platform' | 'title' | 'description'>
): MediaErrors {
  const errors: MediaErrors = {};
  const url = validateWebAddress(values.url);
  if (url) errors.url = url;
  if (!values.platform) errors.platform = 'required';
  if (tooLong(values.title.trim(), TITLE_MAX)) errors.title = 'tooLong';
  if (tooLong(values.description.trim(), DESCRIPTION_MAX)) {
    errors.description = 'tooLong';
  }
  return errors;
}
