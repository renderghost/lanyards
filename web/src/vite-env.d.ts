/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_OAUTH_CLIENT_ID: string;
  readonly VITE_OAUTH_REDIRECT_URI: string;
  /** The origin this build serves, e.g. https://next.lanyards.app. */
  readonly VITE_PUBLIC_BASE_URL: string;
  /** 'true' only in end-to-end test builds. */
  readonly VITE_E2E?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
