import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path' // <-- 1. IMPORTAR MÓDULO PATH

export default defineConfig({
  // ----------------------------------------
  // AÑADIDO: Configuración de la base (publicPath)
  // Esto es crucial para el despliegue en subdirectorios (como GitHub Pages)
  // Reemplaza '/contasoft-erp/' con el nombre de tu repositorio si usas GH Pages
  // Si usas Netlify/Vercel o un dominio raíz, puedes usar simplemente '/'
  base: '/',
  // ----------------------------------------
  
  plugins: [
    vue(),
    VitePWA({
      // ... configuración PWA
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico','logo.png'],
      manifest: {
        name: 'Contasoft ERP',
        short_name: 'Contasoft',
        description: 'Contasoft ERP - demo PWA',
        theme_color: '#0b0f14',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png' }
        ]
      }
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