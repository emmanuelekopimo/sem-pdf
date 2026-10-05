import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The embedding model and PDF parser use native code and large files, so
  // they are loaded with plain Node.js require instead of being bundled.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "unpdf", "pg"],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
