/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
    ],
  },
};
module.exports = nextConfig;
