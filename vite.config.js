import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://3.36.132.79:4000",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, ""),

      },
      "/socket.io": {
        target: "http://3.36.132.79:5000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
