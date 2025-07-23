import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Use esbuild for minification to avoid Rollup issues
    minify: 'esbuild',
    target: 'esnext',
    // Disable source maps to reduce complexity
    sourcemap: false,
  },
  // Use esbuild for dependency optimization
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
})
