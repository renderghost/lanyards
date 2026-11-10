import { tooLong, validateWebAddress } from '@/lib/validation';

import { TITLE_MAX } from './WebLinkForm.constants';
import type { WebLinkErrors, WebLinkValues } from './WebLinkForm.types';

/** Problems with a web link, by field; empty when it can be saved. */
export function validateWebLink(values: WebLinkValues): WebLinkErrors {
  const errors: WebLinkErrors = {};
  const url = validateWebAddress(values.url);
  if (url) errors.url = url;
  if (tooLong(values.title.trim(), TITLE_MAX)) errors.title = 'tooLong';
  return errors;
}
