import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake lucide icons and avoid stale vendor-chunk paths after dependency updates
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
