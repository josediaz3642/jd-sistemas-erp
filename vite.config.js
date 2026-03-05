import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'; // <-- DESCOMENTADO

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // El plugin solo se activará si la importación existe
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: "Contasoft ERP",
        short_name: "ERP",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3b82f6", // Un color azul lindo
        lang: "es",
        icons: [
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
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
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },

  build: {
    outDir: "dist",
  },
}));
