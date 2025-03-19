// vite.config.ts
import { vitePlugin as remix } from "file:///C:/Users/jiram/Documents/GitHub/SeniorProject/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///C:/Users/jiram/Documents/GitHub/SeniorProject/node_modules/vite/dist/node/index.js";
import path from "path";
import tsconfigPaths from "file:///C:/Users/jiram/Documents/GitHub/SeniorProject/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\jiram\\Documents\\GitHub\\SeniorProject";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./app"),
      // Alias for `@`
      "~": path.resolve(__vite_injected_original_dirname, "./app")
      // Alias for `~`
    }
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths()
    // Keeps path resolution aligned with tsconfig.json
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqaXJhbVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXFNlbmlvclByb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGppcmFtXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcU2VuaW9yUHJvamVjdFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvamlyYW0vRG9jdW1lbnRzL0dpdEh1Yi9TZW5pb3JQcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gJ0ByZW1peC1ydW4vZGV2JztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9hcHAnKSwgLy8gQWxpYXMgZm9yIGBAYFxyXG4gICAgICAnfic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2FwcCcpICAvLyBBbGlhcyBmb3IgYH5gXHJcbiAgICB9XHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZW1peCh7XHJcbiAgICAgIGZ1dHVyZToge1xyXG4gICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxyXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxyXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSwgLy8gS2VlcHMgcGF0aCByZXNvbHV0aW9uIGFsaWduZWQgd2l0aCB0c2NvbmZpZy5qc29uXHJcbiAgXSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxjQUFjLGFBQWE7QUFDelcsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sbUJBQW1CO0FBSDFCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLE1BQ3BDLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sbUJBQW1CO0FBQUEsUUFDbkIsc0JBQXNCO0FBQUEsUUFDdEIscUJBQXFCO0FBQUEsTUFDdkI7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQTtBQUFBLEVBQ2hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
