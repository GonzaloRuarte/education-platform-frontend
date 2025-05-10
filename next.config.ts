import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'
// import crypto from 'crypto'

// const revision = crypto.randomUUID()

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: false,
  // additionalPrecacheEntries: [{ url: '/~offline', revision }],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/',
        destination: '/login/',
        permanent: false,
      },
    ]
  },
  output: 'standalone',
}

export default withSerwist(nextConfig)
// export default nextConfig
