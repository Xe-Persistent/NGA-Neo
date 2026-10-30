import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };
import pkg from './package.json' with { type: 'json' };
import { resolve } from 'node:path';

export default defineConfig({
  // 版本号以 package.json 为唯一来源，构建时写入 manifest
  plugins: [react(), crx({ manifest: { ...manifest, version: pkg.version } })],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
});
