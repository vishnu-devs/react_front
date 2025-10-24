import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://actions.totan.in',
        changeOrigin: true,
        // Do not rewrite; forward '/api' to Laravel '/api'
      },
    },
  },
})
