import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/',
        destination: '/dashboard/',
        permanent: false,
      },

    ]
  }
};

export default nextConfig;
