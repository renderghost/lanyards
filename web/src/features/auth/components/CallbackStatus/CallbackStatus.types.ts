import type { OAuthCallbackErrorCode } from '@/lib/atproto/session';

export type CallbackStatusValue = 'working' | OAuthCallbackErrorCode;

export type CallbackStatusProps = {
  status: CallbackStatusValue;
};
