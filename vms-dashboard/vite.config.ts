import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { demoAuthPlugin } from './server/authPlugin';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      demoAuthPlugin({
        username: env.VMS_DEMO_USERNAME || 'omar nad',
        passwordHash: env.VMS_PASSWORD_HASH || '',
        sessionSecret: env.VMS_SESSION_SECRET || 'demo-only-insecure-secret',
      }),
    ],
    resolve: {
      alias: { '@': srcDir },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            motion: ['motion', 'framer-motion', 'gsap'],
            i18n: ['i18next', 'react-i18next'],
          },
        },
      },
    },
  };
});
