import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Single route typegen; default isolated dev `routes.d.ts` was missing `/signup` and broke `LayoutProps` + validator.
    isolatedDevBuild: false,
  },
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
}

export default nextConfig
