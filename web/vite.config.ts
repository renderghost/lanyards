/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { oauthMetadataPlugin } from './plugins/oauthMetadata.ts';

export default defineConfig({
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'posthog', test: /node_modules[\\/]posthog-js/ }],
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
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
});
