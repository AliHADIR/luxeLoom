import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/information.html", destination: "/information", permanent: true }];
  },
};

export default nextConfig;
