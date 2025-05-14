import { vercelPreset } from "@vercel/remix";
import { defineConfig } from "@remix-run/dev";

export default defineConfig({
  serverBuildPath: "build/server/index.js",
  appDirectory: "app",
  assetsBuildDirectory: "build/client/assets",
  publicPath: "/build/client/",
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "node",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: "all",
  ...vercelPreset(),
});
