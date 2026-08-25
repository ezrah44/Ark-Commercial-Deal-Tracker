import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/Ark-Commercial-Deal-Tracker/ —
  // GitHub Pages serves project sites from a subpath, so asset URLs need
  // this prefix or they'll 404.
  base: '/Ark-Commercial-Deal-Tracker/',
})
