/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as path from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: `../node_modules/.vite`,
  build: {
    reportCompressedSize: true,
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module', 'browser'],
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  ssr: {
    noExternal: ['@analogjs/trpc', '@trpc/server', '@spartan-ng/**'],
  },
  plugins: [analog(), nxViteTsPaths(), splitVendorChunkPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
