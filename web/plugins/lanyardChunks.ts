import { PUBLIC_LANYARD_ROUTES } from '../scripts/bundleSize.ts';

/**
 * The module graph as rolldown shows it to a chunk group's `name` function:
 * the parts of its `ChunkingContext` this file reads.
 */
export type ModuleGraph = {
  getModuleInfo(id: string): {
    isEntry: boolean;
    importedIds: readonly string[];
    dynamicallyImportedIds: readonly string[];
    importers: readonly string[];
    dynamicImporters: readonly string[];
  } | null;
};

/** Code a lanyard needs that only a person's lanyard pages load. */
export const LANYARD_PAGE_CHUNK = 'lanyard-page';
/** Code a lanyard needs that other pages load too. */
export const LANYARD_SHARED_CHUNK = 'lanyard-shared';

/**
 * The pages that show a person's lanyard: the public ones, and the owner's
 * own lanyard, customiser and Share.
 */
export const LANYARD_ROUTES = [
  ...PUBLIC_LANYARD_ROUTES,
  'routes/$handle_.edit.tsx',
  'routes/$handle_.share.tsx',
  'routes/lanyard.tsx',
] as const;

type LanyardChunk = typeof LANYARD_PAGE_CHUNK | typeof LANYARD_SHARED_CHUNK;

const normalise = (id: string) => id.replaceAll('\\', '/');

/** Whether `id` is one of a route file's lazily split parts. */
const isSplitOf = (id: string, route: string) =>
  normalise(id).includes(`/src/${route}?tsr-split=`);

/** The modules `from` imports statically, directly or not, but not `skip`. */
function staticClosure(
  graph: ModuleGraph,
  from: string,
  skip: ReadonlySet<string> = new Set()
): Set<string> {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id) || skip.has(id)) continue;
    seen.add(id);
    stack.push(...(graph.getModuleInfo(id)?.importedIds ?? []));
  }
  return seen;
}

/** The entries `from` is loaded by, found through its importers. */
function entriesOf(graph: ModuleGraph, from: string): string[] {
  const seen = new Set<string>();
  const stack = [from];
  const entries: string[] = [];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const info = graph.getModuleInfo(id);
    if (!info) continue;
    if (info.isEntry) entries.push(id);
    stack.push(...info.importers, ...info.dynamicImporters);
  }
  return entries;
}

/**
 * Sorts the code the public lanyard loads lazily into two chunks (spec §2,
 * #177). Left to rolldown, it arrives as a dozen small files, one for each
 * set of pages sharing it; over HTTP/1.1, with six connections per host,
 * every file past the sixth waits another round trip.
 *
 * - `lanyard-page` holds what only a person's lanyard pages load: the
 *   page, its badge's text, its surface and blocks.
 * - `lanyard-shared` holds what a lanyard shares with other pages, such as
 *   the badge's drawing on the homepage (#173) and small helpers.
 *
 * Code the entry loads, code no public lanyard loads, and each route's own
 * small chunk keep rolldown's chunking. Modules a public lanyard reaches
 * only through a barrel the entry loads (lucide's icons) can't be told
 * apart, and keep it too.
 *
 * @param from any module in the graph; the entries are found from it.
 */
export function planLanyardChunks(
  graph: ModuleGraph,
  from: string
): Map<string, LanyardChunk> {
  const entries = entriesOf(graph, from);
  if (entries.length === 0) {
    throw new Error(`lanyardChunks: no entry loads ${from}`);
  }

  const initial = new Set<string>();
  for (const entry of entries) {
    for (const id of staticClosure(graph, entry)) initial.add(id);
  }

  // Every lazily loaded module: the start of a chunk the app can import.
  const lazy = new Set<string>();
  const seen = new Set<string>();
  const stack = [...entries];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const info = graph.getModuleInfo(id);
    stack.push(...(info?.importedIds ?? []));
    for (const next of info?.dynamicallyImportedIds ?? []) {
      lazy.add(next);
      stack.push(next);
    }
  }

  for (const route of LANYARD_ROUTES) {
    if (![...lazy].some((id) => isSplitOf(id, route))) {
      throw new Error(
        `lanyardChunks: ${route} has no lazily loaded part. Update LANYARD_ROUTES if it moved.`
      );
    }
  }
  const isPublic = (id: string) =>
    PUBLIC_LANYARD_ROUTES.some((route) => isSplitOf(id, route));
  const isLanyard = (id: string) =>
    LANYARD_ROUTES.some((route) => isSplitOf(id, route));

  // Which lazy starts load each module beyond the entry's own code.
  const loadedBy = new Map<string, string[]>();
  for (const start of lazy) {
    for (const id of staticClosure(graph, start, initial)) {
      const starts = loadedBy.get(id);
      if (starts) starts.push(start);
      else loadedBy.set(id, [start]);
    }
  }

  const plan = new Map<string, LanyardChunk>();
  for (const [id, starts] of loadedBy) {
    if (lazy.has(id) || !starts.some(isPublic)) continue;
    plan.set(
      id,
      starts.every(isLanyard) ? LANYARD_PAGE_CHUNK : LANYARD_SHARED_CHUNK
    );
  }
  return plan;
}

const plans = new WeakMap<ModuleGraph, Map<string, LanyardChunk>>();

/**
 * A chunk group's `name` function for `planLanyardChunks`. Rolldown keeps
 * one context for each chunking pass, so the plan is made once per pass.
 */
export function lanyardChunkName(
  id: string,
  graph: ModuleGraph
): LanyardChunk | null {
  let plan = plans.get(graph);
  if (!plan) {
    plan = planLanyardChunks(graph, id);
    plans.set(graph, plan);
  }
  return plan.get(id) ?? null;
}
