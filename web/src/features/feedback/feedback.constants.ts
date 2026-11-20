import type { Did } from '@atcute/lexicons';

/** @lanyards.app, whose UserInput board takes the app's feedback (#134). */
export const BOARD_OWNER_DID: Did = 'did:plc:ua3d6biqepazbq6mw4ysotfo';

/** Our Bluesky account. */
export const BLUESKY_HANDLE = 'lanyards.app';

/** Our Signal username: the private route, security issues included. */
export const SIGNAL_USERNAME = 'renderghost.101';

export const USERINPUT_ORIGIN = 'https://userinput.app';

/**
 * Our board's record key: feedback goes to exactly this board, never to
 * another @lanyards.app may make (#144).
 * https://userinput.app/s/did:plc:ua3d6biqepazbq6mw4ysotfo/3n2rdjjovcm2o
 */
export const BOARD_RKEY = '3n2rdjjovcm2o';

/** Our user documentation, in the GitHub wiki. */
export const DOCS_URL = 'https://github.com/renderghost/lanyards/wiki/';

/** Our Signal group, for beta testers to talk with us and each other. */
export const SIGNAL_GROUP_URL =
  'https://signal.group/#CjQKII7UrdZwfftsYT2F7w0zKkFaudDblsBRc2eLpgpP3m-CEhAhjk2AnC2hvLLOFYBrcBe-';
