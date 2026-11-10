import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { SignInError } from './SignInForm.validation';

export const FIELD_ID = 'sign-in-handle';

export const ERROR_MESSAGES: Record<SignInError, MessageDescriptor> = {
  required: msg`Enter your handle`,
  email: msg`Enter your handle, not your email — for example alice.bsky.social`,
  invalid: msg`That doesn't look like a handle — for example alice.bsky.social`,
};
