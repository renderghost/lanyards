import { readFile } from 'node:fs/promises';

import { createMetaHandler } from '../server/metaHandler.ts';

let index: Promise<string> | undefined;

/** The built app shell; Vercel bundles it with the function. */
function readIndex(): Promise<string> {
  index ??= readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  index.catch(() => {
    index = undefined;
  });
  return index;
}

/** /@:handle and /d/:did, with person-specific link-preview meta. */
export const GET = createMetaHandler({
  readIndex,
  baseUrl: process.env.PUBLIC_BASE_URL,
});
