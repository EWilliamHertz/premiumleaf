import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "3000-cs-553118797525-default.cs-europe-west4-pear.cloudshell.dev",
    "*.cloudshell.dev",
    "*.cs-europe-west4-pear.cloudshell.dev",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kdkbccu4g3xc5fao.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
