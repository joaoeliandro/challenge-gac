import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    coverage: {
      include: ['src/**/*.controller.ts'],
      exclude: ['node_modules/**', 'src/**/*.d.ts', 'dist/**'],
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
