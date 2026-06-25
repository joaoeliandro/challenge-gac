import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: false,
  oxc: false,
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    setupFiles: ['./test/setup-e2e.ts'],
    testTimeout: 30000,
    coverage: {
      include: ['src/**/*.controller.ts'],
      exclude: ['node_modules/**', 'src/**/*.d.ts', 'dist/**'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  }
})
