/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { lanyardChunkName } from './plugins/lanyardChunks.ts';
import { oauthMetadataPlugin } from './plugins/oauthMetadata.ts';

export default defineConfig({
  define: {
    // The deployed commit, for feedback's technical details (#134).
    __APP_VERSION__: JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'
    ),
  },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    lingui({ macroTransform: true }),
    tailwindcss(),
    oauthMetadataPlugin(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: 'Lanyards',
        short_name: 'Lanyards',
        description: 'Your conference lanyard on the AT Protocol',
        lang: 'en-GB',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#4020DF',
        background_color: '#f1f0f7',
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/oauth-client-metadata\.json$/,
          /^\/api\//,
        ],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Analytics is optional and online-only: keep it out of the install.
        globIgnores: ['**/posthog-*.js'],
      },
    }),
  ],
  build: {
    // Read by scripts/check-bundle-size.ts to enforce the JS budget.
    manifest: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // A group holds only what it names, not everything that imports.
          includeDependenciesRecursively: false,
          groups: [
            { name: 'posthog', test: /node_modules[\\/]posthog-js/ },
            // The entry's code in the entry. Rolldown would otherwise split
            // out what it shares with lazy routes, so every page would start
            // with eight files, not one (spec §2, #177).
            { name: 'app', tags: ['$initial'] },
            // A lanyard's own code in two files, not a dozen (#177). One of
            // them holds a badge's drawing, wherever one hangs (#173).
            { name: lanyardChunkName },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'plugins/**/*.test.ts',
      'scripts/**/*.test.ts',
      'server/**/*.test.{ts,tsx}',
    ],
  },
});
