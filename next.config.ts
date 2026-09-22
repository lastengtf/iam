import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Dinonaktifkan untuk mendukung dynamic route NextAuth (/api/auth/*)
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
