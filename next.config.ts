import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // S3 bucket for user profile photos and supervision assets
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Static assets in /public aren't content-hashed, so they ship with
        // near-zero cache TTLs by default and fall through to the origin on
        // every request. Give them a real lifetime so the CDN serves them
        // from the edge. stale-while-revalidate (rather than immutable) lets
        // a swapped file — e.g. logo.png / og-default.png — propagate within
        // a day instead of being pinned at the edge.
        source: '/:path*.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=2592000',
          },
        ],
      },
    ]
  },
}

export default nextConfig
