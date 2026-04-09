import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ddbpvv06y/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
