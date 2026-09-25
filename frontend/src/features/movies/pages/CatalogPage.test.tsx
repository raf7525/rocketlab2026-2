import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { seedDb } from '../../../test/mocks/db'
import { server } from '../../../test/mocks/server'
import { renderApp } from '../../../test/utils'

function seedMovies(count: number) {
  seedDb({
    movies: Array.from({ length: count }, (_, i) => makeMovieRow({ titulo: `Filme ${i + 1}` })),
  })
}

describe('CatalogPage', () => {
  it('mostra a primeira página do catálogo', async () => {
    seedMovies(30)
    renderApp('/')

    expect(await screen.findByRole('link', { name: 'Filme 1' })).toBeInTheDocument()
    const catalog = screen.getByRole('region', { name: 'Catálogo' })
    expect(within(catalog).getAllByRole('article')).toHaveLength(24)
    expect(within(catalog).getByText('30 filmes')).toBeInTheDocument()
    expect(within(catalog).getByText('Página 1 de 2')).toBeInTheDocument()
  })

  it('navega entre as páginas', async () => {
    seedMovies(30)
    const { user } = renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Próxima página' }))

    expect(await screen.findByRole('link', { name: 'Filme 25' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Filme 1' })).not.toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Página anterior' }))

    expect(await screen.findByRole('link', { name: 'Filme 1' })).toBeInTheDocument()
  })

  it('abre direto na página indicada no endereço', async () => {
    seedMovies(30)
    renderApp('/?pagina=2')

    expect(await screen.findByRole('link', { name: 'Filme 25' })).toBeInTheDocument()
  })

  it('mostra as reviews populares junto do catálogo', async () => {
    const movie = makeMovieRow({ titulo: 'Blue Beetle' })
    seedDb({
      movies: [movie],
      reviews: [makeReviewRow({ sk_movie_id: movie.sk_movie_id, comentario: 'Adorei!' })],
    })
    renderApp('/')

    const popular = await screen.findByRole('region', { name: 'Reviews populares' })
    expect(await within(popular).findByText('Adorei!')).toBeInTheDocument()
  })

  it('avisa quando o catálogo está vazio', async () => {
    renderApp('/')

    expect(await screen.findByText('Nenhum filme no catálogo ainda.')).toBeInTheDocument()
  })

  it('avisa quando não consegue carregar e permite tentar de novo', async () => {
    seedDb({ movies: [makeMovieRow({ titulo: 'Blue Beetle' })] })
    server.use(
      http.get('/api/v1/movies', () => HttpResponse.json({}, { status: 500 }), { once: true }),
    )
    const { user } = renderApp('/')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o catálogo.',
    )

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('link', { name: 'Blue Beetle' })).toBeInTheDocument()
  })
})
