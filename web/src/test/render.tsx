import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { AppI18nProvider } from '@/i18n/AppI18nProvider';

/** Renders `ui` inside the providers every component expects. */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AppI18nProvider, ...options });
}

/**
 * Renders `ui` with a fresh query client too, for components that read or
 * write through TanStack Query. Returns the client to inspect its cache.
 */
export function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AppI18nProvider>{children}</AppI18nProvider>
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper }) };
}
