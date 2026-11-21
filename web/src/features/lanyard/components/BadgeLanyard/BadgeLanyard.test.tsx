import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BadgeLanyard } from './BadgeLanyard';

describe('BadgeLanyard (#173)', () => {
  it('hangs the badge in a sleeve, from straps printed with the handle', () => {
    const { container } = render(
      <BadgeLanyard handle="alice.test">
        <h1>Dr Ada Example</h1>
      </BadgeLanyard>
    );
    const name = screen.getByRole('heading', { name: 'Dr Ada Example' });
    expect(name.closest('[data-sleeve]')).not.toBeNull();
    const straps = container.querySelectorAll('textPath');
    expect(straps).toHaveLength(2);
    for (const strap of straps) {
      expect(strap.textContent).toContain('@alice.test');
    }
  });

  it('hangs plain straps while the handle is unknown', () => {
    const { container } = render(
      <BadgeLanyard>
        <p>Loading</p>
      </BadgeLanyard>
    );
    expect(container.querySelector('[data-sleeve]')).not.toBeNull();
    for (const strap of container.querySelectorAll('textPath')) {
      expect(strap.textContent).toBe('');
    }
  });
});
