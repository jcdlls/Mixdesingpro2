import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // Genera el árbol de rutas automáticamente
    react(),
    tailwindcss(),        // Plugin oficial de Tailwind v4
    tsconfigPaths(),      // Opcional: resuelve paths de tsconfig.json
  ],
})