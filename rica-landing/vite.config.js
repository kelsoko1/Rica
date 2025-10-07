import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(),
      // Add compression for production builds
      isProd && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // Generate bundle visualization in stats.html
      isProd && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'stats.html'
      }),
    ].filter(Boolean),
    
    server: {
      port: 3030,
      open: true,
      // Add proxy for API requests during development
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    
    build: {
      outDir: 'dist',
      minify: 'esbuild',  // Use esbuild for faster builds (no extra dependencies needed)
      sourcemap: isProd ? false : true,  // No sourcemaps in production for security
      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [],  // Remove console.log and debugger in production
      },
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['axios', 'framer-motion'],
          },
        },
      },
      // Improve chunk loading
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
    },
  };
});
