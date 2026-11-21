import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { SampleLanyard } from './SampleLanyard';

// Not on the homepage for now (#157), but kept working for when it's back.
describe('SampleLanyard (#145)', () => {
  it('shows a lanyard live in a phone frame, and links to it', () => {
    renderWithProviders(<SampleLanyard handle="renderg.host" />);
    const frame = screen.getByTitle('Sample lanyard');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', '/renderg.host');
    expect(frame).toHaveAttribute('loading', 'lazy');
    expect(
      screen.getByRole('link', { name: /View sample profile/ })
    ).toHaveAttribute('href', '/renderg.host');
  });
});
