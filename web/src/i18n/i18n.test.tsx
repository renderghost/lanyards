import { Trans } from '@lingui/react/macro';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppI18nProvider } from './AppI18nProvider';
import { i18n, LOCALE } from './i18n';

describe('i18n', () => {
  it('activates British English', () => {
    expect(LOCALE).toBe('en-GB');
    expect(i18n.locale).toBe('en-GB');
  });

  it('renders translated messages inside the provider', () => {
    render(
      <AppI18nProvider>
        <Trans>Sign in</Trans>
      </AppI18nProvider>
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});
