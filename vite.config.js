import { defineConfig } from 'vite';

export default defineConfig({
  base: '/controle/', 
  server: { open: true, port: 5173 },
  build: { outDir: 'dist' }
});
