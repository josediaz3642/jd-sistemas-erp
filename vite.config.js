import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "logo.png"],
      manifest: {
        name: "Contasoft ERP",
        short_name: "ERP",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    port: 5173,
  },
});
