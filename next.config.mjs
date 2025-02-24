/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**', // Adapté aux URLs Firebase (wildcard)
      },
      {
        protocol: 'https',
        hostname: 'axoriablogeducation.b-cdn.net',
        pathname: '/**', // Accepte toutes les images de ce domaine
      },
    ],
  },
};

export default nextConfig;