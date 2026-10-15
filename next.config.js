let rawBasePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || '';
if (rawBasePath.startsWith('http://') || rawBasePath.startsWith('https://')) {
  try {
    const parsed = new URL(rawBasePath);
    rawBasePath = parsed.pathname;
  } catch {}
}
rawBasePath = rawBasePath.replace(/\/+$/, '');
const basePath = rawBasePath === '/' || !rawBasePath ? '' : (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`);

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
        'uast.ufrpe.br',
        'soumais.uast.ufrpe.br',
        ...(process.env.PUBLIC_BASE_URL ? [process.env.PUBLIC_BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')] : []),
        ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')] : []),
      ],
    },
  },
};

module.exports = nextConfig;
