import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise warning threshold — Three.js is intentionally large and lazy-loaded
    chunkSizeWarningLimit: 1000,
  },
})
