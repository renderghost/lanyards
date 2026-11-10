import { I18nProvider } from '@lingui/react';
import type { ReactNode } from 'react';

import { i18n } from './i18n';

export function AppI18nProvider({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
