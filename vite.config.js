import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './src',  // Ustawienie katalogu głównego, jeśli wszystkie pliki są w "src"
  build: {
    outDir: '../dist', // Katalog wyjściowy Vite (znajduje się poza "src")
    emptyOutDir: true,
  },
});
