import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  gzipSize,
  INITIAL_JS_BUDGET_BYTES,
  initialJsFiles,
  type ManifestChunk,
} from './bundleSize.ts';

const dist = resolve(import.meta.dirname, '../dist');
const manifest = JSON.parse(
  readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8')
) as Record<string, ManifestChunk>;

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
let total = 0;
// The public lanyard route must fit too (spec §2: initial JS for the
// public lanyard route ≤ 200 KB gzipped).
const LANYARD_ROUTES = ['routes/@{$handle}.tsx'];

for (const file of initialJsFiles(manifest, LANYARD_ROUTES)) {
  const size = gzipSize(readFileSync(resolve(dist, file)));
  total += size;
  console.log(`${kb(size).padStart(10)}  ${file}`);
}
console.log(
  `${kb(total).padStart(10)}  initial JS for the lanyard route, gzipped (budget ${kb(INITIAL_JS_BUDGET_BYTES)})`
);

if (total > INITIAL_JS_BUDGET_BYTES) {
  console.error(
    `Over budget by ${kb(total - INITIAL_JS_BUDGET_BYTES)}. Split or lazy-load something.`
  );
  process.exit(1);
}
