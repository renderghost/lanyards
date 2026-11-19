import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validateRecord } from '@/lib/lexicons/validate';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithClient } from '@/test/render';

import { WebLinkForm } from './WebLinkForm';

/** The form hands a valid link over; it writes nothing itself. */
const onSubmit = vi.fn();

beforeEach(() => {
  onSubmit.mockClear();
});

const SCHEME = 'Enter a web address starting with https:// or http://';
const address = () => screen.getByRole('textbox', { name: 'Web address' });
const title = () => screen.getByRole('textbox', { name: 'Title' });
const add = () => screen.getByRole('button', { name: 'Add link' });

describe('WebLinkForm', () => {
  it('asks for a required web address and an optional title', () => {
    renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    expect(address()).toHaveAttribute('type', 'url');
    expect(address()).toHaveAttribute('aria-required', 'true');
    expect(title()).not.toBeRequired();
  });

  it('checks the web address when you leave the field', async () => {
    renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    await userEvent.type(address(), 'ftp://x');
    await userEvent.tab();
    expect(address()).toHaveAttribute('aria-invalid', 'true');
    expect(address()).toHaveAccessibleDescription(SCHEME);
  });

  it('leaves checking to the submit when you leave the field for Add link', async () => {
    // Showing the error on that blur would move Add link before the click
    // lands, so the click (and the submit) would be lost.
    renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    await userEvent.type(address(), 'ftp://x');
    fireEvent.blur(address(), { relatedTarget: add() });
    expect(address()).not.toHaveAttribute('aria-invalid');
  });

  it('keeps what you typed and moves to the first problem on submit', async () => {
    renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    await userEvent.type(address(), 'ftp://x');
    await userEvent.type(title(), 'x'.repeat(101));
    await userEvent.click(add());
    expect(address()).toHaveFocus();
    expect(address()).toHaveValue('ftp://x');
    expect(title()).toHaveAccessibleDescription(
      'Keep the title to 100 characters or fewer'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hands over a valid link and clears the form', async () => {
    renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    await userEvent.type(address(), ' https://ada.example/cv ');
    await userEvent.type(title(), 'CV');
    add().focus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith({
      url: 'https://ada.example/cv',
      title: 'CV',
    });
    expect(
      validateRecord('app.lanyards.link.web', {
        $type: 'app.lanyards.link.web',
        url: 'https://ada.example/cv',
        title: 'CV',
        createdAt: '2026-11-19T12:00:00.000Z',
      }).ok
    ).toBe(true);
    expect(address()).toHaveValue('');
    expect(title()).toHaveValue('');
  });

  it('edits a link in place, from its current values', async () => {
    const onCancel = vi.fn();
    renderWithClient(
      <WebLinkForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        initial={{ url: 'https://ada.example/', title: 'Site' }}
      />
    );
    expect(address()).toHaveValue('https://ada.example/');
    await userEvent.clear(title());
    await userEvent.type(title(), 'Personal site');
    await userEvent.click(screen.getByRole('button', { name: 'Update link' }));
    expect(onSubmit).toHaveBeenCalledWith({
      url: 'https://ada.example/',
      title: 'Personal site',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('has no axe violations, including with errors', async () => {
    const { container } = renderWithClient(<WebLinkForm onSubmit={onSubmit} />);
    await expectNoAxeViolations(container);
    await userEvent.click(add());
    await expectNoAxeViolations(container);
  });
});
