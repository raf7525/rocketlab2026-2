import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

import { seedDb } from './mocks/db'
import { server } from './mocks/server'

// O jsdom não implementa scrollTo, usado pelo <ScrollRestoration> ao trocar de página.
window.scrollTo = () => {}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Cada teste começa com o banco vazio e cadastra só o que precisa.
beforeEach(() => seedDb())

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => server.close())
