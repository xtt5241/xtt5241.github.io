import type { NextConfig } from "next";

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ? new URL(process.env.NEXT_PUBLIC_CMS_URL) : null;
const isLocalCms = cmsUrl ? ["localhost", "127.0.0.1", "::1"].includes(cmsUrl.hostname) : false;
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? basePath : undefined,
  trailingSlash: isStaticExport,
  experimental: {
    serverComponentsHmrCache: false,
  },
  images: {
    dangerouslyAllowLocalIP: isLocalCms,
    unoptimized: isStaticExport,
    qualities: [75, 90],
    remotePatterns: cmsUrl ? [{
      protocol: cmsUrl.protocol.replace(":", "") as "http" | "https",
      hostname: cmsUrl.hostname,
      port: cmsUrl.port,
      pathname: `${cmsUrl.pathname.replace(/\/$/, "")}/**`,
    }] : [],
  },
};

export default nextConfig;
