import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/tmdb-image/:path*',
        destination: 'https://image.tmdb.org/:path*',
      },
    ]
  },
}

export default nextConfig
