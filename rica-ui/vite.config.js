import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ]
      }
    })
  ],
  server: {
    port: 3030,
    host: 'localhost',
    open: true
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',  // Treat .js files as JSX
      },
    },
  },
  server: {
    port: 3030,
    host: 'localhost',
  },
  preview: {
    port: 3030,
    host: 'localhost',
  },
  define: {
    'process.env': {},
  },
});
