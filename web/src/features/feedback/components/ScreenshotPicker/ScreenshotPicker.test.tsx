import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { Screenshot } from '../../images';
import { ScreenshotPicker } from './ScreenshotPicker';

// Re-encoding needs a real canvas: the e2e test covers it.
vi.mock('../../images', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../images')>()),
  prepareImage: vi.fn(async (file: Blob) => file),
}));

let urls = 0;
beforeEach(() => {
  urls = 0;
  URL.createObjectURL = vi.fn(() => `blob:preview-${(urls += 1)}`);
  URL.revokeObjectURL = vi.fn();
});

const png = (name: string) =>
  new File([new Uint8Array(10)], name, { type: 'image/png' });

function Harness({ capture }: { capture?: () => Promise<Blob> }) {
  const [value, setValue] = useState<Screenshot[]>([]);
  return (
    <form aria-label="Feedback">
      <textarea aria-label="Details" />
      <ScreenshotPicker value={value} onChange={setValue} capture={capture} />
    </form>
  );
}

const input = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;

describe('ScreenshotPicker (#134)', () => {
  it('adds screenshots, each with its own alt text', async () => {
    const { container } = renderWithProviders(<Harness />);
    await userEvent.upload(input(), [png('a.png'), png('b.png')]);
    expect(await screen.findAllByRole('img')).toHaveLength(2);
    expect(
      screen.getByRole('textbox', { name: 'Describe screenshot 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Describe screenshot 2' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('takes up to four', async () => {
    renderWithProviders(<Harness />);
    await userEvent.upload(
      input(),
      ['1', '2', '3', '4', '5'].map((n) => png(`${n}.png`))
    );
    expect(await screen.findAllByRole('img')).toHaveLength(4);
    expect(screen.getByText('Up to 4 screenshots')).toBeInTheDocument();
  });

  it('only takes images', async () => {
    renderWithProviders(<Harness />);
    fireEvent.change(input(), {
      target: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' })] },
    });
    expect(
      await screen.findByText('Choose PNG, JPEG, WebP or GIF images')
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('removes one, and moves focus on', async () => {
    renderWithProviders(<Harness />);
    await userEvent.upload(input(), [png('a.png'), png('b.png')]);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove screenshot 1' })
    );
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Remove screenshot 1' })
    ).toHaveFocus();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('attaches a pasted image from anywhere in the form, never pasted text', async () => {
    renderWithProviders(<Harness />);
    const details = screen.getByRole('textbox', { name: 'Details' });
    const paste = (items: { kind: string; type: string; file?: File }[]) =>
      act(() => {
        const event = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'clipboardData', {
          value: {
            items: items.map((item) => ({
              ...item,
              getAsFile: () => item.file ?? null,
            })),
          },
        });
        details.dispatchEvent(event);
      });
    await paste([{ kind: 'string', type: 'text/plain' }]);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    await paste([{ kind: 'file', type: 'image/png', file: png('pasted.png') }]);
    expect(await screen.findAllByRole('img')).toHaveLength(1);
  });

  it('offers to capture the screen only where it can', async () => {
    const { unmount } = renderWithProviders(<Harness />);
    expect(
      screen.queryByRole('button', { name: 'Capture this screen' })
    ).toBeNull();
    unmount();

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getDisplayMedia: vi.fn() },
      configurable: true,
    });
    const capture = vi.fn(async () => png('capture.png'));
    renderWithProviders(<Harness capture={capture} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Capture this screen' })
    );
    expect(capture).toHaveBeenCalled();
    expect(await screen.findAllByRole('img')).toHaveLength(1);
    Reflect.deleteProperty(navigator, 'mediaDevices');
  });
});
