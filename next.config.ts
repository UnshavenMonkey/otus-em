import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://19429ba06ff2.vps.myjino.ru/api/:path*",
      },
    ];
  },
};

export default nextConfig;
