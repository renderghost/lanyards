import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('opens a safe link in a new tab and says so', () => {
    renderWithProviders(
      <ExternalLink href="https://ada.example/">Ada's site</ExternalLink>
    );
    const link = screen.getByRole('link', {
      name: "Ada's site (opens in a new tab)",
    });
    expect(link).toHaveAttribute('href', 'https://ada.example/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders plain text for an unsafe URL', () => {
    renderWithProviders(
      <ExternalLink href="javascript:alert(1)">Sneaky</ExternalLink>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Sneaky')).toBeInTheDocument();
  });
});
