import { defineConfig } from 'vite';

// base './'：部署在 graylightai.github.io/elementary-drill/ 這種子路徑下也能用
export default defineConfig({
  base: './',
  build: { target: 'es2020', assetsInlineLimit: 0 },
  test: { environment: 'node' },
} as import('vite').UserConfig & { test: unknown });
