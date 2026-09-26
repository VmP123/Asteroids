import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'app/static',
  define: {
    global: 'window'
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      url: 'url'
    }
  },
  server: {
    port: 8080,
    open: false
  },
  build: {
    outDir: 'build'
  }
});
