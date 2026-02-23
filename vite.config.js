import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),

    // ✅ PWA SOLO EN BUILD
    mode === "production" &&
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Contasoft ERP",
          short_name: "ERP",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
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
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": "/src",
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
