import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // esbuild is Vite's default minifier; terser would be an extra dependency
    // for a bundle this small.
    minify: 'esbuild',
  },
  test: {
    // Tests sit next to the modules they cover. Nothing imports them, so they
    // never reach the production bundle.
    include: ['**/*.test.js'],
  },
});
