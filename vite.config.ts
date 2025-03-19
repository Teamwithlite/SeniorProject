// vite.config.ts
import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'), // Alias for @
      '~': path.resolve(__dirname, './app')  // Alias for ~
    }
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(), // Keeps path resolution aligned with tsconfig.json
  ],
});