import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'

import { routes } from '../app/routes'

function createTestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderRouter(routeObjects: RouteObject[], path: string) {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] })
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user: userEvent.setup(), router, queryClient, ...result }
}

/** Renderiza um componente solto, com React Query e um roteador (para os <Link>). */
export function renderWithProviders(ui: ReactElement, { path = '/' }: { path?: string } = {}) {
  return renderRouter([{ path: '*', element: ui }], path)
}

/** Renderiza a aplicação inteira já na rota indicada. */
export function renderApp(path: string) {
  return renderRouter(routes, path)
}
