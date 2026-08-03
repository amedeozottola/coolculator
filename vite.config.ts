import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// GitHub Pages serves this repo from https://<user>.github.io/coolculator/,
// so all asset URLs (and the PWA scope) must be rooted at /coolculator/.
const base = '/coolculator/'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/favicon.ico', 'icons/apple-touch-icon-180x180.png'],
      manifest: {
        id: base,
        scope: base,
        start_url: base,
        name: 'Coolculator',
        short_name: 'Coolculator',
        description: 'Diagnosi carica refrigerante (superheat/subcooling) per impianti split.',
        theme_color: '#0B3D5C',
        background_color: '#0B3D5C',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'it',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
