import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      include: ['src/**/*.service.ts'],
      exclude: [
        'node_modules/**',
        'src/**/*.d.ts',
        'dist/**',
        'src/**/*.module.ts',
        'src/**/*.dto.ts',
      ],
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
