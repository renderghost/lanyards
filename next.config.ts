import type { NextConfig } from 'next';

// Note: OAuth configuration is now handled server-side via @atproto/oauth-client-node
// For local development, access the app via http://127.0.0.1:3000 (NOT localhost)
// See src/lib/oauth/client.ts for OAuth configuration

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
      },
    ],
  },
  serverExternalPackages: [
    'pino',
    'thread-stream',
    'sonic-boom',
    '@atproto/common',
    '@atproto/xrpc',
    '@atproto/lexicon',
    'multiformats',
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
