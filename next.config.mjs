/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pull-zone-axoriablog.b-cdn.net',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://axoria-blog.vercel.app', // URL de ton site en production
  },
};

export default nextConfig;
