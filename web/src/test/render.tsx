import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { AppI18nProvider } from '@/i18n/AppI18nProvider';

/** Renders `ui` inside the providers every component expects. */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AppI18nProvider, ...options });
}
