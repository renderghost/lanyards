import { defineLexiconConfig } from '@atcute/lex-cli';

/**
 * Lexicon sources for the web app.
 * - lexicons/lanyards: authored here and published from lanyards.app.
 * - lexicons/vendor: third-party schemas pinned from their published
 *   records (`npm run lex:pull`), so reads are validated against them.
 * Generated TypeScript lives in src/lexicons (`npm run lex:gen`).
 */
export default defineLexiconConfig({
  generate: {
    files: ['lexicons/**/*.json'],
    outdir: 'src/lexicons/',
    imports: ['@atcute/atproto', '@atcute/bluesky'],
  },
  pull: {
    outdir: 'lexicons/vendor/',
    clean: true,
    sources: [
      {
        type: 'atproto',
        mode: 'nsids',
        nsids: [
          'id.sifa.defs',
          'id.sifa.getProfileView',
          'id.sifa.profile.self',
          'id.sifa.profile.position',
          'id.sifa.profile.education',
          'id.sifa.profile.skill',
          'id.sifa.profile.externalAccount',
          'id.sifa.profile.publication',
          'id.sifa.profile.presentation',
          'id.sifa.profile.presentationDelivery',
          'id.sifa.profile.location',
          'site.standard.document',
          'site.standard.publication',
          'org.tangled.repo.declaration',
          'org.tangled.repo.manifest',
          'org.tangled.repo.defs',
          'network.cosmik.collection',
          'network.cosmik.collectionLink',
          'network.cosmik.card',
          'network.cosmik.defs',
          // Referenced by the schemas above.
          'community.lexicon.location.address',
          'org.tangled.actor.defs',
          'site.standard.theme.basic',
          'site.standard.theme.color',
        ],
      },
    ],
  },
});
