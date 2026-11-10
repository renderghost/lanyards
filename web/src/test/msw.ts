import { setupServer } from 'msw/node';

/** Shared MSW server. Unhandled requests fail the test (see setup.ts). */
export const server = setupServer();
