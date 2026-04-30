import { defineConfig } from 'vite'; // 👈 Aquí estaba el error, debe ser 'vite'
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: "Contasoft ERP",
        short_name: "ERP",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, 
    port: 5173,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});