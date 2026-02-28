import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tmdb-image': {
        target: 'https://image.tmdb.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmdb-image/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    }
  }
})
