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
 * (dynamic imports) are excluded.
 */
export function initialJsFiles(
  manifest: Record<string, ManifestChunk>
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
  return files;
}

export function gzipSize(contents: Buffer): number {
  return gzipSync(contents, { level: 9 }).length;
}
