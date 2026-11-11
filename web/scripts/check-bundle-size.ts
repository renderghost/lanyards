import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  gzipSize,
  INITIAL_JS_BUDGET_BYTES,
  type ManifestChunk,
  PUBLIC_LANYARD_ROUTES,
  routeSizes,
} from './bundleSize.ts';

const dist = resolve(import.meta.dirname, '../dist');
const manifest = JSON.parse(
  readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8')
) as Record<string, ManifestChunk>;

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
const sizeOf = (file: string) => gzipSize(readFileSync(resolve(dist, file)));

let over = false;
for (const { route, files, total } of routeSizes(
  manifest,
  PUBLIC_LANYARD_ROUTES,
  sizeOf
)) {
  for (const file of files) {
    console.log(`${kb(sizeOf(file)).padStart(10)}  ${file}`);
  }
  console.log(
    `${kb(total).padStart(10)}  initial JS for ${route}, gzipped (budget ${kb(INITIAL_JS_BUDGET_BYTES)})\n`
  );
  if (total > INITIAL_JS_BUDGET_BYTES) {
    console.error(
      `${route} is over budget by ${kb(total - INITIAL_JS_BUDGET_BYTES)}. Split or lazy-load something.`
    );
    over = true;
  }
}
if (over) process.exit(1);
