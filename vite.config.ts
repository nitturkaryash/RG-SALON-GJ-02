import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { apiPlugin } from './vite-plugin-api.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Make environment variables available to process.env
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
        // Fix esbuild JSX issues
        esbuild: {
          jsx: 'automatic',
          jsxDev: false,
        },
      }),
      apiPlugin(),
    ],
    server: {
      port: 5173,
      open: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true,
        },
        output: {
          comments: false,
        },
      },
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            emotion: ['@emotion/react', '@emotion/styled'],
            mui: ['@mui/material', '@mui/icons-material'],
            router: ['react-router-dom'],
            charts: ['chart.js', 'recharts'],
            calendar: [
              '@fullcalendar/react',
              '@fullcalendar/daygrid',
              '@fullcalendar/timegrid',
            ],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@mui/icons-material',
        'react-router-dom',
      ],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
