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

  it('uses the product UI link colour by default', () => {
    renderWithProviders(
      <ExternalLink href="https://example.com">Docs</ExternalLink>
    );
    expect(screen.getByRole('link').className).toContain('text-ui-primary');
  });

  it('uses the lanyard accent with tone="accent"', () => {
    renderWithProviders(
      <ExternalLink href="https://example.com" tone="accent">
        Docs
      </ExternalLink>
    );
    const { className } = screen.getByRole('link');
    expect(className).toContain('text-accent-text');
    expect(className).not.toContain('text-ui-primary');
  });

  it('renders plain text for an unsafe URL', () => {
    renderWithProviders(
      <ExternalLink href="javascript:alert(1)">Sneaky</ExternalLink>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Sneaky')).toBeInTheDocument();
  });
});
