import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { COVERS } from '@/design/covers';

import { CoverPattern } from './CoverPattern';

describe('CoverPattern', () => {
  it.each(COVERS)(
    'draws %s as one decorative vector, fetching nothing',
    (pattern) => {
      const { container } = render(
        <CoverPattern pattern={pattern} initials="BP" />
      );
      const svgs = container.querySelectorAll(':scope > svg');
      expect(svgs).toHaveLength(1);
      expect(svgs[0]).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelector('img, image, foreignObject')).toBeNull();
      // Drawn in the accent's cover colours, so it recolours with the accent.
      expect(container.innerHTML).toMatch(/var\(--(?:cover-|accent)/);
    }
  );

  it('draws the owner’s initials on the monogram', () => {
    const { container } = render(
      <CoverPattern pattern="monogram" initials="BP" />
    );
    expect(container.textContent).toContain('BP');
  });

  // On a narrow cover the wide drawing is cropped: the monogram sits at the
  // right, as on the canvas, so it keeps to that edge rather than the middle.
  it('keeps the monogram at the right edge of a narrow cover', () => {
    const { container } = render(
      <CoverPattern pattern="monogram" initials="BP" />
    );
    expect(container.querySelector('svg svg')).toHaveAttribute(
      'preserveAspectRatio',
      'xMaxYMid slice'
    );
  });

  it('fills the hazard cover with the accent itself', () => {
    const { container } = render(<CoverPattern pattern="hazard" initials="" />);
    expect(container.querySelector('[fill="var(--accent)"]')).not.toBeNull();
  });

  it('gives each cover on a page its own pattern ids', () => {
    const { container } = render(
      <>
        <CoverPattern pattern="dots" initials="" />
        <CoverPattern pattern="dots" initials="" />
      </>
    );
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
