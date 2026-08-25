import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In dev, forward API calls to the local Express server so the
      // client can always just call a relative "/api/..." path — the
      // same code works unchanged once deployed behind one server.
      '/api': 'http://localhost:4000',
    },
  },
})
