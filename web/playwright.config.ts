import { defineConfig, devices } from '@playwright/test';

// Lets environments with a preinstalled Chromium (e.g. cloud sandboxes) use it.
const executablePath = process.env.PW_CHROMIUM_PATH;

const chromium = {
  ...devices['Desktop Chrome'],
  ...(executablePath ? { launchOptions: { executablePath } } : {}),
};

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'off',
  },
  webServer: {
    command: 'npm run build:e2e && npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /perf\.spec\.ts/,
      use: chromium,
    },
    // The loading budget is measured alone, once everything else has run:
    // other browsers working in parallel on the same machine would skew it.
    {
      name: 'perf',
      testMatch: /perf\.spec\.ts/,
      dependencies: ['chromium'],
      use: chromium,
    },
  ],
});
