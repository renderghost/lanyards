import type { NextConfig } from 'next';

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
  // Externalize packages to avoid bundling test files and node-specific code
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
    // Type checking is enabled, but ignore build errors for external packages
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
