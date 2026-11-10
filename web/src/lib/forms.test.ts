import { describe, expect, it } from 'vitest';

import { leavingForSubmit } from './forms';

function form() {
  const element = document.createElement('form');
  element.innerHTML =
    '<input name="url" /><button type="submit">Add</button><button type="button">Other</button>';
  const [input] = element.getElementsByTagName('input');
  const [submit, other] = element.getElementsByTagName('button');
  return { input: input!, submit: submit!, other: other! };
}

describe('leavingForSubmit', () => {
  it('is true when focus moves to the same form’s submit button', () => {
    const { input, submit } = form();
    expect(
      leavingForSubmit({ currentTarget: input, relatedTarget: submit })
    ).toBe(true);
  });

  it('is false for any other destination', () => {
    const { input, other } = form();
    const elsewhere = form();
    expect(
      leavingForSubmit({ currentTarget: input, relatedTarget: other })
    ).toBe(false);
    expect(
      leavingForSubmit({ currentTarget: input, relatedTarget: null })
    ).toBe(false);
    expect(
      leavingForSubmit({
        currentTarget: input,
        relatedTarget: elsewhere.submit,
      })
    ).toBe(false);
  });
});
