import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'MagazinApp - Управление магазином',
        short_name: 'MagazinApp',
        description: 'Система учета для магазинов и аптек',
        theme_color: '#3b82f6',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?utm_source=pwa',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [],
        categories: ['business', 'productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Главная',
            short_name: 'Главная',
            description: 'Главная страница',
            url: '/',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Аккаунт',
            short_name: 'Аккаунт',
            description: 'Мой аккаунт',
            url: '/account',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 часа
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  base: '/'
})

