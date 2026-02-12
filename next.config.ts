import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/holavoca',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
