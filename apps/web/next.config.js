/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/backend"],
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
    ],
  },
};
module.exports = nextConfig;
