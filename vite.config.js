import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-icon.svg',
      ],
      manifest: {
        name: 'Lista de compras',
        short_name: 'Compras',
        description: 'Lista de compras da Croácia 2026',
        lang: 'pt-BR',
        start_url: '/supermarkt/',
        scope: '/supermarkt/',
        display: 'standalone',
        background_color: '#dfeaf4',
        theme_color: '#dfeaf4',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/supermarkt/index.html',
      },
    }),
  ],
  base: '/supermarkt/',
})
