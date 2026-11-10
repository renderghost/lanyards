import { render } from '@testing-library/react';
import { siGithub, siOrcid } from 'simple-icons';
import { describe, expect, it } from 'vitest';

import { PlatformIcon } from './PlatformIcon';

describe('PlatformIcon', () => {
  it.each([
    ['github', siGithub.path],
    ['orcid', siOrcid.path],
  ] as const)('draws the %s mark', (platform, path) => {
    const { container } = render(<PlatformIcon platform={platform} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('path')).toHaveAttribute('d', path);
  });

  it('draws a globe for platforms without a mark', () => {
    const { container } = render(<PlatformIcon platform="website" />);
    expect(container.querySelector('svg')).toHaveClass('lucide-globe');
  });
});
