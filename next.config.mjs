/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pull-zone-axoriablog.b-cdn.net',
        pathname: '/**', // Accepte toutes les images de ce domaine
      },
    ],
  },
};

export default nextConfig;