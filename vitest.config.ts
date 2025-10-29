import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/integration/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'clover'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__tests__/**',
        '**/test/**',
        '**/tests/**',
        '**/*.config.*',
        '**/*.d.ts',
        '**/coverage/**',
        'src/main.tsx',
        'src/test/**',
        'playwright.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      include: [
        'src/**/*.{ts,tsx}',
      ],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@models': path.resolve(__dirname, './src/models'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@workers': path.resolve(__dirname, './src/workers'),
      '@di': path.resolve(__dirname, './src/di'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
});
