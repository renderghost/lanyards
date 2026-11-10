import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

// Vercel runs ignoreCommand in the Root Directory (web/): exit 0 skips the
// build, any other exit code builds.
const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
) as { ignoreCommand: string };

const run = (env: Record<string, string>) =>
  spawnSync('sh', ['-c', config.ignoreCommand], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
  }).status;

const HEAD = execSync('git rev-parse HEAD').toString().trim();
// Git's empty tree: "the previous deployment had no web/ at all".
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

describe('vercel ignoreCommand', () => {
  it('skips the build when web/ is unchanged since the last deployment', () => {
    expect(run({ VERCEL_GIT_PREVIOUS_SHA: HEAD })).toBe(0);
  });

  it('builds when web/ changed anywhere since the last deployment', () => {
    expect(run({ VERCEL_GIT_PREVIOUS_SHA: EMPTY_TREE })).not.toBe(0);
  });

  it('builds when there is no previous deployment', () => {
    expect(run({ VERCEL_GIT_PREVIOUS_SHA: '' })).not.toBe(0);
  });

  it('builds when the previous commit is not in the clone', () => {
    expect(
      run({
        VERCEL_GIT_PREVIOUS_SHA: '0123456789abcdef0123456789abcdef01234567',
      })
    ).not.toBe(0);
  });
});
