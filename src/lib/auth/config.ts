/**
 * Authentication Configuration
 *
 * Centralized configuration for switching between authentication methods
 */

export type AuthMethod = 'oauth' | 'app_password';

export function getAuthMethod(): AuthMethod {
  const method = process.env.AUTH_METHOD || 'app_password';

  if (method !== 'oauth' && method !== 'app_password') {
    console.warn(
      `Invalid AUTH_METHOD: ${method}. Defaulting to 'app_password'`
    );
    return 'app_password';
  }

  return method as AuthMethod;
}

export function isOAuthEnabled(): boolean {
  return getAuthMethod() === 'oauth';
}

export function isAppPasswordEnabled(): boolean {
  return getAuthMethod() === 'app_password';
}
