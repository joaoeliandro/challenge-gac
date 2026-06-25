import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: false,
  oxc: false,
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
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    tsconfigPaths: true
  }
})
