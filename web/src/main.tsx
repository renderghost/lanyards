import './styles/index.css';

import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from './app/AppProviders';
import { preloadRouteCode } from './app/preloadRouteCode';
import { router } from './app/router';
import {
  browserDoNotTrack,
  DEFAULT_POSTHOG_HOST,
  initAnalytics,
  isFramed,
  track,
} from './lib/analytics/analytics';
import { configureAuth } from './lib/atproto/session';

function start() {
  // The page's own code downloads while React starts (spec §2, #177).
  preloadRouteCode(router);
  configureAuth();
  void initAnalytics({
    key: import.meta.env.VITE_POSTHOG_KEY,
    host: import.meta.env.VITE_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
    doNotTrack: browserDoNotTrack(),
    framed: isFramed(),
  });
  track('app_opened');

  const container = document.getElementById('root');
  if (!container) throw new Error('Missing #root element');

  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>
  );
}

start();
