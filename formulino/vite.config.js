import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // O '/nombre-de-tu-repo/' si no es un repositorio de usuario raíz
})