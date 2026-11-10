import { gzipSync } from 'node:zlib';

/** Spec §2: initial JS of at most 200 KB, gzipped. */
export const INITIAL_JS_BUDGET_BYTES = 200 * 1024;

export type ManifestChunk = {
  file: string;
  isEntry?: boolean;
  isDynamicEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
};

/**
 * The JavaScript the browser must download before the app can start: the
 * index.html entry plus everything it imports statically. Lazy chunks
 * (dynamic imports) are excluded, except those of the routes named in
 * `routeKeys` (matched against manifest keys), which a page needs before
 * it can render — such as the public lanyard.
 */
export function initialJsFiles(
  manifest: Record<string, ManifestChunk>,
  routeKeys: string[] = []
): string[] {
  const entry = manifest['index.html'];
  if (!entry) throw new Error('Vite manifest has no index.html entry');

  const files: string[] = [];
  const seen = new Set<string>();
  const visit = (chunk: ManifestChunk) => {
    if (seen.has(chunk.file)) return;
    seen.add(chunk.file);
    files.push(chunk.file);
    for (const key of chunk.imports ?? []) {
      const imported = manifest[key];
      if (imported) visit(imported);
    }
  };
  visit(entry);
  for (const routeKey of routeKeys) {
    const keys = Object.keys(manifest).filter((key) => key.includes(routeKey));
    if (keys.length === 0) {
      throw new Error(`Vite manifest has no chunk for ${routeKey}`);
    }
    for (const key of keys) {
      const chunk = manifest[key];
      if (chunk) visit(chunk);
    }
  }
  return files;
}

export function gzipSize(contents: Buffer): number {
  return gzipSync(contents, { level: 9 }).length;
}
