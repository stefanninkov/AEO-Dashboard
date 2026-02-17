import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/AEO-Dashboard/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — shared by everything, cached well
          'vendor-react': ['react', 'react-dom'],
          // Firebase — large but only used by auth + firestore hooks
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Recharts — only used by Dashboard + Metrics views
          'vendor-recharts': ['recharts'],
          // Lucide icons — used everywhere but tree-shakeable
          'vendor-lucide': ['lucide-react'],
          // PDF export — heavy, only loaded when user exports
          'vendor-jspdf': ['jspdf'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
