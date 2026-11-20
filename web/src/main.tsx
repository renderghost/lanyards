import './styles/index.css';

import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from './app/AppProviders';
import { router } from './app/router';
import {
  browserDoNotTrack,
  DEFAULT_POSTHOG_HOST,
  initAnalytics,
  isFramed,
  track,
} from './lib/analytics/analytics';
import { configureAuth } from './lib/atproto/session';
import { leaveFor, movedTo } from './lib/origin/movedOrigin';

function start() {
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

// On a retired origin, such as an installed copy of the beta, go to where
// the app lives now instead of starting here (#154).
const moved = movedTo(
  window.location.href,
  import.meta.env.VITE_PUBLIC_BASE_URL
);
if (moved) void leaveFor(moved);
else start();
