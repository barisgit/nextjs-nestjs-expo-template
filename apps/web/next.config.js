/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@repo/ui",
    "@repo/backend",
    "@t3-oss/env-nextjs",
    "@t3-oss/env-core",
  ],
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
    ],
  },
};
module.exports = nextConfig;
