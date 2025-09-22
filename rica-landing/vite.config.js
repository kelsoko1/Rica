import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(),
      // Add compression for production builds
      isProd && compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      isProd && compression({
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
      minify: 'terser',
      sourcemap: isProd ? false : true,  // No sourcemaps in production for security
      terserOptions: {
        compress: {
          drop_console: isProd,  // Remove console.log in production
          drop_debugger: isProd, // Remove debugger statements in production
        },
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
