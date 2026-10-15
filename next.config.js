const basePath = process.env.BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
        'www.uast.ufrpe.br',
        'soumais.uast.ufrpe.br',
        ...(process.env.PUBLIC_BASE_URL ? [process.env.PUBLIC_BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')] : []),
        ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')] : []),
      ],
    },
  },
};

module.exports = nextConfig;
