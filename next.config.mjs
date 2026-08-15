/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb', 'bcryptjs', 'jsonwebtoken']
  }
};

export default nextConfig;
