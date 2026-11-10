import { describe, expect, it } from 'vitest';

import { validateWebLink } from './WebLinkForm.validation';

describe('validateWebLink', () => {
  it('needs a web address starting with https:// or http://', () => {
    expect(validateWebLink({ url: '', title: '' })).toEqual({
      url: 'required',
    });
    expect(validateWebLink({ url: 'ftp://x', title: '' })).toEqual({
      url: 'scheme',
    });
  });

  it('keeps the title to 100 characters', () => {
    expect(
      validateWebLink({ url: 'https://a.example', title: 'x'.repeat(101) })
    ).toEqual({ title: 'tooLong' });
    expect(
      validateWebLink({ url: 'https://a.example', title: 'x'.repeat(100) })
    ).toEqual({});
  });
});
