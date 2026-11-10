/**
 * Checks that every lexicon in lexicons/lanyards is published from the
 * lanyards.app account and matches the local JSON.
 * Usage: npm run lex:verify
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  CompositeDidDocumentResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
} from '@atcute/identity-resolver';
import type { Nsid } from '@atcute/lexicons';
import {
  DohJsonLexiconAuthorityResolver,
  LexiconSchemaResolver,
} from '@atcute/lexicon-resolver';

import { compareLexicon } from './verifyLexicons.ts';

const LEXICON_DID = 'did:plc:ua3d6biqepazbq6mw4ysotfo';
const ROOT = resolve(import.meta.dirname, '../lexicons/lanyards');

const authorityResolver = new DohJsonLexiconAuthorityResolver({
  dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query',
});
const schemaResolver = new LexiconSchemaResolver({
  didDocumentResolver: new CompositeDidDocumentResolver({
    methods: {
      plc: new PlcDidDocumentResolver(),
      web: new WebDidDocumentResolver(),
    },
  }),
});

function lexiconFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? lexiconFiles(join(dir, entry.name))
      : entry.name.endsWith('.json')
        ? [join(dir, entry.name)]
        : []
  );
}

async function check(local: { id: string }): Promise<string | null> {
  const nsid = local.id as Nsid;
  let authority: string;
  try {
    authority = await authorityResolver.resolve(nsid);
  } catch (error) {
    return `no _lexicon TXT record (${String(error)})`;
  }
  if (authority !== LEXICON_DID) {
    return `TXT record points to ${authority}, expected ${LEXICON_DID}`;
  }
  try {
    const published = await schemaResolver.resolve(LEXICON_DID, nsid);
    const differences = compareLexicon(local, published.rawSchema as object);
    return differences.length
      ? `published copy differs at ${differences.join(', ')}`
      : null;
  } catch (error) {
    return `not published (${String(error)})`;
  }
}

let failures = 0;
for (const file of lexiconFiles(ROOT)) {
  const local = JSON.parse(readFileSync(file, 'utf8')) as { id: string };
  const problem = await check(local);
  if (problem) failures += 1;
  console.log(problem ? `✗ ${local.id}: ${problem}` : `✓ ${local.id}`);
}
process.exit(failures ? 1 : 0);
