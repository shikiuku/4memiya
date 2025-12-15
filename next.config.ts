import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.jp',
      },
      {
        protocol: 'https',
        hostname: 'vmpjaoylbulirsjxhklw.supabase.co',
      },
    ],
  },
};


export default nextConfig;
