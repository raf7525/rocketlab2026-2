import { setupWorker } from 'msw/browser'

import { seedDb } from './db'
import { movieRows, reviewRows } from './fixtures'
import { handlers } from './handlers'

/** API simulada no navegador (`npm run dev:mock`), com a amostra dos CSVs. Recarregar a página zera. */
seedDb({ movies: movieRows, reviews: reviewRows })

export const worker = setupWorker(...handlers)
