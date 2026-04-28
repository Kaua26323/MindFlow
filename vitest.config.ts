import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Permite usar 'describe', 'it', 'expect' sem importar
    environment: 'node',
    include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts'], // Onde o Vitest buscará os testes
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
