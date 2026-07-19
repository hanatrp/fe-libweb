import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
  const rawUrl = process.env.VITE_API_BASE_URL || 'https://libweb.my.id/public/api';
  let targetOrigin = 'https://libweb.my.id';
  try {
    targetOrigin = new URL(rawUrl).origin;
  } catch (e) {
    // fallback
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: targetOrigin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            if (rawUrl.includes('/public')) {
              return '/public' + path;
            }
            return path;
          },
        },
      },
    },
  };
});
