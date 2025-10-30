// G:/contasoft-erp/vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path' // <-- 1. IMPORTAR MÓDULO PATH

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // ... configuración PWA
    })
  ],
  
  // ----------------------------------------
  // 2. AÑADIR SECCIÓN RESOLVE
  // ----------------------------------------
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Configura @ para que apunte a la carpeta src
    },
  },
  // ----------------------------------------
  
  build: { outDir: 'dist' },
  server: { port: 5173 }
})