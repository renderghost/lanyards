import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { SkillsBlock } from './SkillsBlock';

describe('SkillsBlock', () => {
  it('lists skills', () => {
    renderWithProviders(
      <SkillsBlock items={[{ key: 'k', name: 'TypeScript' }]} />
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('TypeScript');
  });
});
