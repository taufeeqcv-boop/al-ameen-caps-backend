import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), netlify()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
})
