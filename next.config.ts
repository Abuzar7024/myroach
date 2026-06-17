import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "myroach-6cc80.firebasestorage.app",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/products/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
