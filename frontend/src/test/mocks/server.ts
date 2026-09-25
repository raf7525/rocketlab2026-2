import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/** API simulada nos testes (Node). */
export const server = setupServer(...handlers)
