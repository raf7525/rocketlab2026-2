import type { RouteObject } from 'react-router'

import { CatalogPage } from '../features/movies/pages/CatalogPage'
import { MovieDetailPage } from '../features/movies/pages/MovieDetailPage'
import { PageMessage } from '../shared/components/PageMessage'
import { Layout } from './Layout'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'filmes/:movieId', element: <MovieDetailPage /> },
      { path: '*', element: <PageMessage title="Página não encontrada" /> },
    ],
  },
]
