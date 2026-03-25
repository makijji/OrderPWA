import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH ?? '/'
const normalizedBase = base.endsWith('/') ? base : `${base}/`
const withBase = (path: string) => `${normalizedBase}${path.replace(/^\/+/, '')}`

export default defineConfig({
  base: normalizedBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'OrderPWA',
        short_name: 'OrderPWA',
        description: 'Offline-first monthly stock replenishment planner',
        theme_color: '#0e7490',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: normalizedBase,
        orientation: 'portrait-primary',
        icons: [
          {
            src: withBase('icons/icon-192.svg'),
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: withBase('icons/icon-512.svg'),
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: withBase('index.html'),
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
        ],
      },
    }),
  ],
})
