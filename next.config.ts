import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pengaturan Gambar (Biar cover album dari Youtube muncul)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  // Kita kosongkan experimental dulu biar tidak error di Next.js 16
};

export default nextConfig;