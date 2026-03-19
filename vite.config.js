import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()]

  // Bundle analyzer — run with: ANALYZE=true npx vite build
  if (process.env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer')
    plugins.push(visualizer({ open: true, gzipSize: true, filename: 'stats.html' }))
  }

  return {
    base: '/AEO-Dashboard/',
    plugins,
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 550,
      rollupOptions: {
        // Exclude jsPDF optional deps we never use (saves ~382 kB / ~109 kB gzip)
        external: ['canvg', 'html2canvas', 'dompurify'],
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
            // Zustand — tiny state management, shared by everything
            'vendor-zustand': ['zustand'],
            // i18n — changes less frequently than app code
            'vendor-i18n': ['i18next', 'react-i18next'],
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
      exclude: ['e2e/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        include: ['src/utils/**', 'src/hooks/**', 'src/data/**'],
      },
    },
  }
})
