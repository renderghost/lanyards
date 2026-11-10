import { spawnSync } from 'node:child_process';
import {
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

type Config = {
  ignoreCommand: string;
  functions?: Record<string, { includeFiles?: string }>;
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
) as Config;

describe('vercel.json', () => {
  it('sends lanyard and image paths to the preview functions before the app', () => {
    expect(config.rewrites).toEqual([
      { source: '/@:handle', destination: '/api/meta?handle=:handle' },
      { source: '/d/:did', destination: '/api/meta?did=:did' },
      { source: '/og/p/:did.png', destination: '/api/og?did=:did' },
      { source: '/og/default.png', destination: '/api/og' },
      { source: '/((?!api/).*)', destination: '/index.html' },
    ]);
  });

  it('bundles the files each preview function reads at runtime', () => {
    expect(config.functions?.['api/meta.ts']?.includeFiles).toBe(
      'dist/index.html'
    );
    const og = config.functions?.['api/og.ts']?.includeFiles ?? '';
    expect(globSync(og).sort()).toEqual([
      'node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2',
      'node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2',
      'node_modules/@resvg/resvg-wasm/index_bg.wasm',
    ]);
  });

  it('sets security headers on every response', () => {
    const all = config.headers.find((entry) => entry.source === '/(.*)');
    expect(all?.headers).toEqual(
      expect.arrayContaining([
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ])
    );
  });
});

/**
 * Runs vercel.json's ignore step in a throwaway repo whose app lives in
 * web/, as Vercel does with Root Directory web. Exit 0 skips the build,
 * 1 builds, and anything else fails the deployment.
 */
const repos: string[] = [];

afterEach(() => {
  for (const repo of repos.splice(0)) {
    rmSync(repo, { recursive: true, force: true });
  }
});

function ignoreStep(previous: (commits: string[]) => string | undefined) {
  const repo = mkdtempSync(join(tmpdir(), 'vercel-ignore-'));
  repos.push(repo);
  const web = join(repo, 'web');
  mkdirSync(web);
  const git = (...args: string[]) =>
    spawnSync(
      'git',
      [
        ...['-c', 'user.name=Test', '-c', 'user.email=test@example.test'],
        ...['-c', 'commit.gpgsign=false'],
        ...args,
      ],
      { cwd: repo, encoding: 'utf8' }
    ).stdout.trim();
  const commit = (path: string, text: string) => {
    writeFileSync(join(repo, path), text);
    git('add', '-A');
    git('commit', '-qm', path);
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  const commits = [
    commit('web/app.ts', 'one'),
    commit('README.md', 'outside web/'),
  ];
  const previousSha = previous(commits);
  const result = spawnSync('sh', ['-c', config.ignoreCommand], {
    cwd: web,
    env: {
      ...process.env,
      ...(previousSha ? { VERCEL_GIT_PREVIOUS_SHA: previousSha } : {}),
    },
  });
  const changeWeb = () => commit('web/app.ts', 'two');
  return {
    status: result.status,
    rerun() {
      changeWeb();
      return spawnSync('sh', ['-c', config.ignoreCommand], {
        cwd: web,
        env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: previousSha },
      }).status;
    },
  };
}

describe('vercel.json ignore step', () => {
  it('builds the first deployment, with no previous commit', () => {
    const step = ignoreStep(() => undefined);
    expect(step.status).toBe(1);
  });

  it('builds when the previous commit is outside the shallow clone', () => {
    const step = ignoreStep(() => '4328f937c5821bd4ba9ad24372637ad642be6205');
    expect(step.status).toBe(1);
  });

  it('skips when nothing in the app changed, and builds when it did', () => {
    const step = ignoreStep(([first]) => first);
    expect(step.status).toBe(0);
    expect(step.rerun()).toBe(1);
  });
});
