import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // Use esbuild for minification to avoid Rollup issues
    minify: 'esbuild',
    target: 'esnext',
    // Disable source maps to reduce complexity
    sourcemap: false,
    // Optimize for Node.js 22
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  // Use esbuild for dependency optimization
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // Ensure compatibility with Node.js 22
  define: {
    global: 'globalThis'
  }
})
