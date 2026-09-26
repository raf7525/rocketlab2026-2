/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // O front chama /api/v1/... e o Vite encaminha para o FastAPI (sem precisar de CORS).
    // Os testes ponta a ponta (`npm run e2e`) apontam para uma API só deles, em outra porta.
    proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:8000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
