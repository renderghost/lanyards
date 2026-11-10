/**
 * Fails if a production build contains the end-to-end test session, which
 * only VITE_E2E=true builds may include. Run after a normal build.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MARKERS = ['pds.e2e.test', 'lanyards:e2e-session'];
const dist = resolve(import.meta.dirname, '../dist');

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : /\.(js|html)$/.test(entry.name)
        ? [join(dir, entry.name)]
        : []
  );
}

const found = files(dist).flatMap((file) => {
  const contents = readFileSync(file, 'utf8');
  return MARKERS.filter((marker) => contents.includes(marker)).map(
    (marker) => `${file.slice(dist.length + 1)}: ${marker}`
  );
});

if (found.length) {
  console.error('The production build contains the e2e test session:');
  for (const line of found) console.error(`  ${line}`);
  process.exit(1);
}
console.log('No e2e test session in the production build.');
