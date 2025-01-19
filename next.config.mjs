/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@convex-dev/auth': '@convex-dev/auth/nextjs/server'
    };
    return config;
  }
};

export default nextConfig;
