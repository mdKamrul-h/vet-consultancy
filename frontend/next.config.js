/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'api.dicebear.com' },
      { hostname: 'picsum.photos' },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
    if (!backendUrl) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
