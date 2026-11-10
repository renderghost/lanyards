import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { TextField } from './TextField';

describe('TextField', () => {
  it('links the error to the input and marks it invalid', () => {
    renderWithProviders(
      <TextField label="Your handle" name="handle" error="Enter your handle" />
    );
    const input = screen.getByLabelText('Your handle');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByText('Enter your handle');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('links the hint and marks required fields', () => {
    renderWithProviders(
      <TextField
        label="Your handle"
        name="handle"
        hint="For example alice.bsky.social"
        required
      />
    );
    const input = screen.getByLabelText('Your handle');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('aria-invalid');
    const hint = screen.getByText('For example alice.bsky.social');
    expect(input.getAttribute('aria-describedby')).toContain(hint.id);
  });

  it('has no axe violations with a hint and an error', async () => {
    const { container } = renderWithProviders(
      <TextField
        label="Your handle"
        name="handle"
        hint="For example alice.bsky.social"
        error="Enter your handle"
      />
    );
    await expectNoAxeViolations(container);
  });
});
