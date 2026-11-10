import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/Toaster/Toaster';
import { SessionProvider } from '@/features/auth/session/SessionProvider';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';

import { queryClient } from './queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppI18nProvider>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </AppI18nProvider>
    </QueryClientProvider>
  );
}
