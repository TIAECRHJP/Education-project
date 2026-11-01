import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    cacheDir: path.join(os.tmpdir(), 'gurukul-ai-vite-cache'),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // This standalone server runs without HMR so it does not need a WebSocket port.
      hmr: false,
      watch: null,
    },
  };
});
