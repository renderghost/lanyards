import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockSection } from './BlockSection';

describe('BlockSection', () => {
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
