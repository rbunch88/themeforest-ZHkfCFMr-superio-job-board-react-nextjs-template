/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Provide the @/ alias so we can use import x from '@/...'
    config.resolve.alias['@'] = __dirname;
    return config;
  },
};

module.exports = nextConfig;
