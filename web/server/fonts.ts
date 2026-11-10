import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import { initWasm } from '@resvg/resvg-wasm';

const require = createRequire(import.meta.url);

export type BadgeFonts = { regular: Buffer; bold: Buffer };

let ready: Promise<BadgeFonts> | undefined;

/**
 * Loads the DM Sans weights and the resvg WebAssembly module once per
 * function instance. Static weights, because satori renders only the
 * default instance of a variable font.
 */
export function loadBadgeAssets(): Promise<BadgeFonts> {
  ready ??= (async () => {
    const [wasm, regular, bold] = await Promise.all([
      readFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm')),
      readFile(
        require.resolve('@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2')
      ),
      readFile(
        require.resolve('@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2')
      ),
    ]);
    await initWasm(wasm);
    return { regular, bold };
  })();
  return ready;
}
