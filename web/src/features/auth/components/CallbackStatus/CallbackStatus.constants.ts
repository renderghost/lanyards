import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { OAuthCallbackErrorCode } from '@/lib/atproto/session';

export const ERROR_COPY: Record<OAuthCallbackErrorCode, MessageDescriptor> = {
  denied: msg`Sign-in was cancelled.`,
  missing: msg`This sign-in link has expired or was already used.`,
  failed: msg`We couldn't finish signing you in.`,
};
