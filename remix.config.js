import { vercelPreset } from "@vercel/remix";

/** @type {import("@remix-run/dev").AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  assetsBuildDirectory: "build/client/assets",
  publicPath: "/build/client/",
  serverBuildPath: "build/server/index.js",
  serverModuleFormat: "esm",
  serverDependenciesToBundle: "all",
  ...vercelPreset(),
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  }
};
