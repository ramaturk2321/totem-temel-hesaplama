import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/statik-hesap", // eymenreklam.com.tr/statik-hesap/ altında yayınlanır
  trailingSlash: true,
};

export default nextConfig;
