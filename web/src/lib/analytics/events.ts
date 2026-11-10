/** Every product event Lanyards records. Properties never identify people. */
export type AnalyticsEvent =
  | 'app_opened'
  | 'sign_in_started'
  | 'sign_in_completed'
  | 'sign_in_failed'
  | 'sign_up_started'
  | 'oauth_scope_fallback'
  | 'signed_out'
  | 'session_expired'
  | 'pwa_update_applied';

export type AnalyticsProps = Record<string, string | number | boolean>;
