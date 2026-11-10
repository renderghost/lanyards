import { Client, simpleFetchHandler } from '@atcute/client';
import {
  CompositeDidDocumentResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  XrpcHandleResolver,
} from '@atcute/identity-resolver';

import { PUBLIC_APPVIEW } from './endpoints';

export { PUBLIC_APPVIEW };

/**
 * Resolves handles and DIDs. Browsers have no DNS access, so handles are
 * resolved through the public AppView.
 */
export const identityResolver = new LocalActorResolver({
  handleResolver: new XrpcHandleResolver({ serviceUrl: PUBLIC_APPVIEW }),
  didDocumentResolver: new CompositeDidDocumentResolver({
    methods: {
      plc: new PlcDidDocumentResolver(),
      web: new WebDidDocumentResolver(),
    },
  }),
});

export const publicAppView = new Client({
  handler: simpleFetchHandler({ service: PUBLIC_APPVIEW }),
});
