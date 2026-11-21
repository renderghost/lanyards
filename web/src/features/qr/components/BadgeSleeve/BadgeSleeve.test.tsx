import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { BadgeSleeve } from './BadgeSleeve';

describe('BadgeSleeve (#170)', () => {
  it('holds the badge, marked as the sleeve', () => {
    render(
      <BadgeSleeve>
        <h2>Welcome</h2>
      </BadgeSleeve>
    );
    const heading = screen.getByRole('heading', { name: 'Welcome' });
    expect(heading.closest('[data-sleeve]')).not.toBeNull();
  });

  it('draws its slot and glare as decoration only', () => {
    const { container } = render(
      <BadgeSleeve>
        <p>Badge</p>
      </BadgeSleeve>
    );
    const sleeve = container.querySelector('[data-sleeve]');
    const decoration = [...(sleeve?.children ?? [])].filter(
      (child) => child.tagName === 'SPAN'
    );
    expect(decoration).toHaveLength(2);
    for (const part of decoration) {
      expect(part).toHaveAttribute('aria-hidden', 'true');
      expect(part).toBeEmptyDOMElement();
    }
  });

  it('takes layout classes, and a ref for what turns it', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <BadgeSleeve
        ref={ref}
        className="origin-top p-4"
        slotClassName="top-4"
        glareClassName="hidden"
      >
        <p>Badge</p>
      </BadgeSleeve>
    );
    const sleeve = container.querySelector<HTMLElement>('[data-sleeve]');
    expect(ref.current).toBe(sleeve);
    // Its own padding gives way to the caller's.
    expect(sleeve?.className).toMatch(/(^|\s)p-4(\s|$)/);
    expect(sleeve?.className).not.toMatch(/(^|\s)p-2\.5(\s|$)/);
    const [slot, glare] = [...(sleeve?.querySelectorAll('span') ?? [])];
    expect(slot?.className).toMatch(/(^|\s)top-4(\s|$)/);
    expect(glare?.className).toMatch(/(^|\s)hidden(\s|$)/);
  });
});
