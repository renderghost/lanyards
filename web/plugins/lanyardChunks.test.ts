import { describe, expect, it, vi } from 'vitest';

import {
  LANYARD_PAGE_CHUNK,
  LANYARD_SHARED_CHUNK,
  lanyardChunkName,
  type ModuleGraph,
  planLanyardChunks,
} from './lanyardChunks';

const split = (route: string) => `/app/src/routes/${route}?tsr-split=component`;

const HANDLE = split('$handle.tsx');
const DID = split('d.$did.tsx');
const EDIT = split('$handle_.edit.tsx');
const SHARE = split('$handle_.share.tsx');
const LANYARD = split('lanyard.tsx');
const HOME = split('index.tsx');

type Edges = Record<string, { imports?: string[]; lazy?: string[] }>;

/** A module graph from each module's static and dynamic imports. */
function graphOf(edges: Edges, entry = '/app/index.html'): ModuleGraph {
  const ids = new Set(Object.keys(edges));
  for (const { imports = [], lazy = [] } of Object.values(edges)) {
    for (const id of [...imports, ...lazy]) ids.add(id);
  }
  const info = new Map(
    [...ids].map((id) => [
      id,
      {
        isEntry: id === entry,
        importedIds: edges[id]?.imports ?? [],
        dynamicallyImportedIds: edges[id]?.lazy ?? [],
        importers: [] as string[],
        dynamicImporters: [] as string[],
      },
    ])
  );
  for (const [id, { imports = [], lazy = [] }] of Object.entries(edges)) {
    for (const next of imports) info.get(next)!.importers.push(id);
    for (const next of lazy) info.get(next)!.dynamicImporters.push(id);
  }
  return { getModuleInfo: (id) => info.get(id) ?? null };
}

/** An app shaped like Lanyards: an entry, its lanyard routes and a home. */
const app = (overrides: Edges = {}): Edges => ({
  '/app/index.html': { imports: ['/app/src/main.tsx'] },
  '/app/src/main.tsx': {
    imports: ['react', '/app/src/lib/utils.ts'],
    lazy: [HANDLE, DID, EDIT, SHARE, LANYARD, HOME],
  },
  [HANDLE]: { imports: ['/app/src/LanyardPage.tsx', 'react'] },
  [DID]: { imports: ['/app/src/LanyardPage.tsx'] },
  [EDIT]: { imports: ['/app/src/hero.ts', '/app/src/Customiser.tsx'] },
  [SHARE]: { imports: ['/app/src/hero.ts', '/app/src/BadgeSleeve.tsx'] },
  [LANYARD]: { imports: ['/app/src/Customiser.tsx'] },
  [HOME]: { imports: ['/app/src/BadgeSleeve.tsx', '/app/src/Landing.tsx'] },
  '/app/src/LanyardPage.tsx': {
    imports: [
      '/app/src/hero.ts',
      '/app/src/BadgeSleeve.tsx',
      '/app/src/lib/utils.ts',
    ],
  },
  '/app/src/BadgeSleeve.tsx': { imports: ['/app/src/CoverPattern.tsx'] },
  ...overrides,
});

describe('planLanyardChunks', () => {
  const plan = planLanyardChunks(graphOf(app()), '/app/src/hero.ts');

  it('puts what only lanyard pages load in the page chunk', () => {
    expect(plan.get('/app/src/LanyardPage.tsx')).toBe(LANYARD_PAGE_CHUNK);
    // The customiser and Share load the hero too: they show a lanyard.
    expect(plan.get('/app/src/hero.ts')).toBe(LANYARD_PAGE_CHUNK);
  });

  it('puts what a lanyard shares with other pages in the shared chunk', () => {
    expect(plan.get('/app/src/BadgeSleeve.tsx')).toBe(LANYARD_SHARED_CHUNK);
    expect(plan.get('/app/src/CoverPattern.tsx')).toBe(LANYARD_SHARED_CHUNK);
  });

  it("leaves the entry's code, other pages' code and route chunks alone", () => {
    expect(plan.has('react')).toBe(false);
    expect(plan.has('/app/src/lib/utils.ts')).toBe(false);
    expect(plan.has('/app/src/Customiser.tsx')).toBe(false);
    expect(plan.has('/app/src/Landing.tsx')).toBe(false);
    expect(plan.has(HANDLE)).toBe(false);
    expect(plan.has(DID)).toBe(false);
  });

  it('keeps a module that is also loaded lazily in its own chunk', () => {
    const lazyPage = planLanyardChunks(
      graphOf(
        app({
          [HOME]: {
            imports: ['/app/src/Landing.tsx'],
            lazy: ['/app/src/LanyardPage.tsx'],
          },
        })
      ),
      HOME
    );
    expect(lazyPage.has('/app/src/LanyardPage.tsx')).toBe(false);
    // The homepage can load it now, through the page it imports lazily.
    expect(lazyPage.get('/app/src/hero.ts')).toBe(LANYARD_SHARED_CHUNK);
  });

  it('reads Windows paths', () => {
    const windows = (id: string) => id.replaceAll('/', '\\');
    const edges = Object.fromEntries(
      Object.entries(app()).map(([id, { imports = [], lazy = [] }]) => [
        windows(id),
        { imports: imports.map(windows), lazy: lazy.map(windows) },
      ])
    );
    const graph = graphOf(edges, windows('/app/index.html'));
    expect(
      planLanyardChunks(graph, windows(HANDLE)).get(
        windows('/app/src/LanyardPage.tsx')
      )
    ).toBe(LANYARD_PAGE_CHUNK);
  });

  it('fails the build when a lanyard route is no longer split', () => {
    const edges = app();
    edges['/app/src/main.tsx']!.lazy = [HANDLE, DID, EDIT, LANYARD, HOME];
    expect(() => planLanyardChunks(graphOf(edges), HANDLE)).toThrow(
      'routes/$handle_.share.tsx has no lazily loaded part'
    );
  });

  it('fails the build when no entry loads the module', () => {
    expect(() =>
      planLanyardChunks(graphOf(app()), '/app/src/Unused.tsx')
    ).toThrow('no entry loads /app/src/Unused.tsx');
  });
});

describe('lanyardChunkName', () => {
  it('plans once for each chunking pass', () => {
    const graph = graphOf(app());
    const read = vi.spyOn(graph, 'getModuleInfo');
    expect(lanyardChunkName('/app/src/LanyardPage.tsx', graph)).toBe(
      LANYARD_PAGE_CHUNK
    );
    const reads = read.mock.calls.length;
    expect(lanyardChunkName('/app/src/BadgeSleeve.tsx', graph)).toBe(
      LANYARD_SHARED_CHUNK
    );
    expect(lanyardChunkName('react', graph)).toBeNull();
    expect(read.mock.calls.length).toBe(reads);
  });

  it('plans afresh for a new pass', () => {
    const edges = app();
    expect(lanyardChunkName('/app/src/Landing.tsx', graphOf(edges))).toBeNull();
    edges[HANDLE]!.imports!.push('/app/src/Landing.tsx');
    expect(lanyardChunkName('/app/src/Landing.tsx', graphOf(edges))).toBe(
      LANYARD_SHARED_CHUNK
    );
  });
});
