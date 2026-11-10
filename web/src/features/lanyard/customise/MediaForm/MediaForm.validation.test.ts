import { describe, expect, it } from 'vitest';

import { validateMedia } from './MediaForm.validation';

const valid = {
  url: 'https://podcasts.example/ep1',
  platform: 'spotify',
  title: '',
  description: '',
};

describe('validateMedia', () => {
  it('accepts a web address and platform alone', () => {
    expect(validateMedia(valid)).toEqual({});
  });

  it('needs a web address and a platform', () => {
    expect(validateMedia({ ...valid, url: '', platform: '' })).toEqual({
      url: 'required',
      platform: 'required',
    });
  });

  it('keeps the title to 200 and the description to 1,000 characters', () => {
    expect(
      validateMedia({
        ...valid,
        title: 'x'.repeat(201),
        description: 'x'.repeat(1001),
      })
    ).toEqual({ title: 'tooLong', description: 'tooLong' });
  });
});
