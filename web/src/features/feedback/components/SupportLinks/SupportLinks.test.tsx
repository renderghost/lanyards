import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { FeedbackContext } from '../../useFeedback';
import { SupportLinks } from './SupportLinks';

const show = vi.fn();
const support = (props: Parameters<typeof SupportLinks>[0] = {}) =>
  renderWithProviders(
    <FeedbackContext value={{ show }}>
      <SupportLinks {...props} />
    </FeedbackContext>
  );

describe('SupportLinks (#134)', () => {
  it('offers feedback, the docs, our Signal group and our Bluesky', async () => {
    const { container } = support();
    const region = screen.getByRole('region', { name: 'Beta support' });
    expect(
      within(region).getByRole('button', { name: 'Send feedback' })
    ).toBeInTheDocument();
    expect(
      within(region).getByRole('link', { name: /Documentation/ })
    ).toHaveAttribute('href', 'https://github.com/renderghost/lanyards/wiki/');
    expect(
      within(region).getByRole('link', { name: /Signal group/ })
    ).toHaveAttribute(
      'href',
      'https://signal.group/#CjQKII7UrdZwfftsYT2F7w0zKkFaudDblsBRc2eLpgpP3m-CEhAhjk2AnC2hvLLOFYBrcBe-'
    );
    expect(
      within(region).getByRole('link', { name: /Connect on Bluesky/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
    await expectNoAxeViolations(container);
  });

  it('opens feedback, putting focus back on the button afterwards', async () => {
    show.mockClear();
    support();
    const button = screen.getByRole('button', { name: 'Send feedback' });
    await userEvent.click(button);
    expect(show).toHaveBeenCalledTimes(1);
    button.blur();
    show.mock.calls[0]![0]();
    expect(button).toHaveFocus();
  });

  it('can leave its heading to a sheet that names it, and say when chosen', async () => {
    show.mockClear();
    const onChoose = vi.fn();
    const returnFocus = vi.fn();
    support({ heading: false, onChoose, returnFocus });
    expect(screen.queryByRole('heading', { name: 'Beta support' })).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Send feedback' })
    );
    expect(onChoose).toHaveBeenCalled();
    expect(show).toHaveBeenCalledWith(returnFocus);
  });
});
