/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next 14
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
  // Expose only NEXT_PUBLIC_ vars to the browser — all others stay server-side
  env: {},
};

module.exports = nextConfig;
