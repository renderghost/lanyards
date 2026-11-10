import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en-GB',
  locales: ['en-GB'],
  catalogs: [
    {
      path: '<rootDir>/src/i18n/locales/{locale}/messages',
      include: ['src'],
      exclude: ['**/*.test.*', 'src/test/**'],
    },
  ],
});
