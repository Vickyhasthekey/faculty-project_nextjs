import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  // The native binding loads libonnxruntime.so.1 from $ORIGIN. File tracing
  // picks up the .node addon and misses the shared library beside it.
  outputFileTracingIncludes: {
    "/api/search": [
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*",
      "./node_modules/@huggingface/transformers/.cache/**/*",
    ],
    "/api/filters": ["./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*"],
    "/api/chat": [
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*",
      "./node_modules/@huggingface/transformers/.cache/**/*",
    ],
  },
};

export default nextConfig;
