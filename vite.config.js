import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  // GitHub Pages serves this project from a repository subpath, not a domain
  // root. Overridable so a fork or a custom domain doesn't have to patch this.
  base: process.env.PUBLIC_BASE_PATH ?? '/WebGL-Shader-Playground/',
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
