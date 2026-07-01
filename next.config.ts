import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep firebase-admin (and its jwks-rsa → jose ESM chain) external to the
  // server bundle so Next resolves it at runtime instead of bundling it.
  serverExternalPackages: ["firebase-admin"],
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
