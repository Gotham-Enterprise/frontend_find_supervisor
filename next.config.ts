import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Single route typegen; default isolated dev `routes.d.ts` was missing `/signup` and broke `LayoutProps` + validator.
    isolatedDevBuild: false,
  },
}

export default nextConfig
