import type { RouteObject } from 'react-router'

import { CatalogPage } from '../features/movies/pages/CatalogPage'
import { MovieDetailPage } from '../features/movies/pages/MovieDetailPage'
import { NewMoviePage } from '../features/movies/pages/NewMoviePage'
import { PageMessage } from '../shared/components/PageMessage'
import { Layout } from './Layout'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      // O caminho fixo vence o `:movieId` abaixo, então "novo" nunca é lido como id de filme.
      { path: 'filmes/novo', element: <NewMoviePage /> },
      { path: 'filmes/:movieId', element: <MovieDetailPage /> },
      { path: '*', element: <PageMessage title="Página não encontrada" /> },
    ],
  },
]
