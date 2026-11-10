import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { TextAreaField } from './TextAreaField';

describe('TextAreaField', () => {
  it('labels the text area', () => {
    renderWithProviders(
      <TextAreaField label="Description" name="description" />
    );
    expect(
      screen.getByRole('textbox', { name: 'Description' })
    ).toBeInTheDocument();
  });

  it('links its error and marks itself invalid', async () => {
    const { container } = renderWithProviders(
      <TextAreaField
        label="Description"
        name="description"
        error="Keep it short"
      />
    );
    const area = screen.getByRole('textbox', { name: 'Description' });
    expect(area).toHaveAttribute('aria-invalid', 'true');
    expect(area).toHaveAccessibleDescription('Keep it short');
    await expectNoAxeViolations(container);
  });
});
