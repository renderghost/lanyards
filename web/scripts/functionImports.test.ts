import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

/**
 * Relative module specifiers a file loads at runtime: `import type` is
 * erased by verbatimModuleSyntax, so it isn't followed. Every other import
 * or re-export, including `import { type X }`, survives compilation.
 */
const IMPORT =
  /(?:import|export)\s+(type\s+)?(?:[^'";]*?\sfrom\s+)?['"](\.\.?\/[^'"]+)['"]|import\(\s*['"](\.\.?\/[^'"]+)['"]\s*\)/g;

function runtimeImports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(IMPORT)]
    .filter((match) => !match[1])
    .map((match) => resolve(dirname(file), match[2] ?? match[3] ?? ''));
}

/** Every local module a Vercel function loads, directly or indirectly. */
function functionGraph(): string[] {
  const seen = new Set<string>();
  const queue = readdirSync(resolve(ROOT, 'api'))
    .filter((name) => !name.includes('.test.'))
    .map((name) => resolve(ROOT, 'api', name));
  while (queue.length > 0) {
    const file = queue.shift() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    if (existsSync(file)) queue.push(...runtimeImports(file));
  }
  return [...seen].map((file) => relative(ROOT, file)).sort();
}

describe('Vercel function modules', () => {
  // Vercel's Node builder compiles and bundles .ts dependencies only. A
  // .tsx (or .js) module is left out of the function, which then fails to
  // load on every request (#110).
  it('are all .ts files that exist', () => {
    const graph = functionGraph();
    expect(graph).toContain('api/og.ts');
    expect(
      graph.filter(
        (file) => !file.endsWith('.ts') || !existsSync(resolve(ROOT, file))
      )
    ).toEqual([]);
  });
});
