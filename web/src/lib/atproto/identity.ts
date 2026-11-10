import { Client, simpleFetchHandler } from '@atcute/client';
import {
  CompositeDidDocumentResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  XrpcHandleResolver,
} from '@atcute/identity-resolver';

/** Bluesky's public AppView: unauthenticated reads with CORS enabled. */
export const PUBLIC_APPVIEW = 'https://public.api.bsky.app';

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
