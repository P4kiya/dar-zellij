import type { NextConfig } from 'next';

// While this is a proposal next to the live marrakech-riads.com page, search engines are asked
// to stay away (see README, "Before launch").
const DEMO_NOINDEX = true;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The root layout is the dynamic [lang] segment, so unmatched URLs get their own 404
  // (src/app/global-not-found.tsx).
  experimental: { globalNotFound: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          ...(DEMO_NOINDEX
            ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
            : []),
        ],
      },
      {
        // Photos never change under the same name (give a replaced photo a new name).
        source: '/images/:file*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
