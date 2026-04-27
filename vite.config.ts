import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Use esbuild for minification — much faster than terser in constrained envs
    minify: 'esbuild',
    target: 'es2020',
    // Raise warning limit — our data files are intentionally large
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split heavy data files into separate async chunks
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui':      ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'data-exercises': ['./src/data/exercises', './src/data/exerciseVideos'],
          'data-education': ['./src/data/educacion'],
          'data-nutrition': ['./src/data/foods', './src/data/fullwRoutines'],
        },
      },
    },
  },
  esbuild: {
    // Skip type annotations in transforms — TS already checked locally
    target: 'es2020',
  },
})
