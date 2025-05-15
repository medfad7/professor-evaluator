require('dotenv').config(); // Load dotenv first

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
    'https://9000-idx-studio-1745872458722.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev'
    ]
  }
};

export default nextConfig;
