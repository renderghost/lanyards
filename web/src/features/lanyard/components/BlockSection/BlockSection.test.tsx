import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockSection } from './BlockSection';

describe('BlockSection', () => {
  it('frames the block with one header row', () => {
    renderWithProviders(
      <BlockSection
        heading="Links"
        status="ready"
        owner
        handle={<button type="button">Reorder Links</button>}
        editLinks={[{ label: 'Edit on Sifa', url: 'https://sifa.id/p/ada' }]}
        controls={<button type="button">Move Links down</button>}
      >
        <p>Content</p>
      </BlockSection>
    );
    const region = screen.getByRole('region', { name: 'Links' });
    const header = region.querySelector<HTMLElement>('[data-block-header]');
    expect(header).not.toBeNull();
    const order = [
      screen.getByRole('button', { name: 'Reorder Links' }),
      screen.getByRole('heading', { level: 2, name: 'Links' }),
      screen.getByRole('link', { name: /Edit on Sifa/ }),
      screen.getByRole('button', { name: 'Move Links down' }),
    ];
    for (const element of order) expect(header).toContainElement(element);
    for (let index = 1; index < order.length; index += 1) {
      expect(
        order[index - 1]!.compareDocumentPosition(order[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('collapsed shows only the header row, with its note', () => {
    renderWithProviders(
      <BlockSection
        heading="Talks"
        status="loading"
        owner
        note="Hidden from visitors"
        collapsed
      >
        <p>Content</p>
      </BlockSection>
    );
    const region = screen.getByRole('region', { name: 'Talks' });
    expect(region).toHaveAttribute('data-collapsed');
    expect(region).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('Hidden from visitors')).toBeInTheDocument();
    expect(screen.queryByText('Content')).toBeNull();
    expect(region.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('labels its content with a level-two heading', async () => {
    const { container } = renderWithProviders(
      <BlockSection heading="Talks" status="ready" owner={false}>
        <p>Content</p>
      </BlockSection>
    );
    expect(screen.getByRole('region', { name: 'Talks' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Talks' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('marks itself busy while loading', () => {
    renderWithProviders(
      <BlockSection heading="Talks" status="loading" owner={false} />
    );
    expect(screen.getByRole('region', { name: 'Talks' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('tells the owner which source failed and retries it', async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <BlockSection
        heading="Talks"
        status="error"
        failedSources={['sifa']}
        owner
        onRetry={onRetry}
      />
    );
    expect(screen.getByText("Couldn't load Sifa")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('notes a partial failure to the owner under the content', () => {
    renderWithProviders(
      <BlockSection
        heading="Links"
        status="ready"
        failedSources={['sifa', 'lanyards']}
        owner
        onRetry={() => undefined}
      >
        <p>Some links</p>
      </BlockSection>
    );
    expect(screen.getByText('Some links')).toBeInTheDocument();
    expect(
      screen.getByText("Couldn't load Sifa, Lanyards")
    ).toBeInTheDocument();
  });

  it('links the owner to where each source is edited, not visitors', () => {
    const editLinks = [
      { label: 'Edit on Sifa', url: 'https://sifa.id/p/alice.test?edit=true' },
      { label: 'Edit in Bluesky', url: 'https://bsky.app/profile/alice.test' },
    ];
    const { rerender } = renderWithProviders(
      <BlockSection heading="Links" status="ready" owner editLinks={editLinks}>
        <p>Items</p>
      </BlockSection>
    );
    expect(screen.getByRole('link', { name: /Edit on Sifa/ })).toHaveAttribute(
      'href',
      'https://sifa.id/p/alice.test?edit=true'
    );
    expect(
      screen.getByRole('link', { name: /Edit in Bluesky/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/alice.test');
    rerender(
      <BlockSection
        heading="Links"
        status="ready"
        owner={false}
        editLinks={editLinks}
      >
        <p>Items</p>
      </BlockSection>
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('never shows failures to visitors', () => {
    renderWithProviders(
      <BlockSection
        heading="Links"
        status="ready"
        failedSources={['sifa']}
        owner={false}
      >
        <p>Some links</p>
      </BlockSection>
    );
    expect(screen.queryByText(/Couldn't load/)).not.toBeInTheDocument();
  });
});
