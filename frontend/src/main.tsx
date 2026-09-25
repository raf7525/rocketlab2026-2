import './app/global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { createQueryClient } from './app/queryClient'
import { routes } from './app/routes'

/** No `npm run dev:mock`, o MSW responde a API no navegador antes da aplicação subir. */
async function startMockApi() {
  if (import.meta.env.VITE_API_MOCKS !== 'true') return
  const { worker } = await import('./test/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const router = createBrowserRouter(routes)
const queryClient = createQueryClient()

startMockApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
