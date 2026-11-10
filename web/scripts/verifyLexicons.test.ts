import { describe, expect, it } from 'vitest';

import { compareLexicon } from './verifyLexicons';

const doc = {
  lexicon: 1,
  id: 'app.lanyards.link.web',
  defs: {
    main: {
      type: 'record',
      key: 'tid',
      record: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri' },
          title: { type: 'string', maxLength: 100 },
        },
      },
    },
  },
};

describe('compareLexicon', () => {
  it('finds no differences between identical documents', () => {
    expect(compareLexicon(doc, structuredClone(doc))).toEqual([]);
  });

  it('ignores the $type a published schema record carries', () => {
    const published = { $type: 'com.atproto.lexicon.schema', ...doc };
    expect(compareLexicon(doc, published)).toEqual([]);
  });

  it('names the path of a changed value', () => {
    const published = structuredClone(doc);
    published.defs.main.record.properties.title.maxLength = 300;
    expect(compareLexicon(doc, published)).toEqual([
      'defs.main.record.properties.title.maxLength',
    ]);
  });

  it('names added and removed properties and changed array items', () => {
    const published = structuredClone(doc) as Record<string, unknown> & {
      defs: { main: { record: { required: string[] } } };
      description?: string;
    };
    published.description = 'extra';
    published.defs.main.record.required = ['url', 'createdAt'];
    expect(compareLexicon(doc, published).sort()).toEqual([
      'defs.main.record.required.1',
      'description',
    ]);
  });
});
