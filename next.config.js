/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel serverless functions - max 60s
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'googleapis'],
  },
};

module.exports = nextConfig;
