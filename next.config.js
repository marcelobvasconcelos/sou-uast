/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
      allowedOrigins: [
        'localhost:3000',
        '172.16.68.50:97',
        '172.16.68.50',
        ...(process.env.PUBLIC_BASE_URL ? [process.env.PUBLIC_BASE_URL.replace(/^https?:\/\//, '')] : []),
        ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL.replace(/^https?:\/\//, '')] : []),
      ],
    },
  },
};

module.exports = nextConfig;
