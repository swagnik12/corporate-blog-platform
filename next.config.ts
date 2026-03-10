import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google (OAuth profile photos)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // GitHub
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Discord
      { protocol: "https", hostname: "cdn.discordapp.com" },
      // Facebook
      { protocol: "https", hostname: "*.fbcdn.net" },
      // Local development
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
