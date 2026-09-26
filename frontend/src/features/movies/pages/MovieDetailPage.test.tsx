import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { renderApp } from '../../../test/utils'
import { CATALOG_PAGE_SIZE } from '../api/moviesApi'

type User = ReturnType<typeof renderApp>['user']

async function publishReview(user: User) {
  await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), 'Rafael')
  await user.click(screen.getByRole('radio', { name: '5 estrelas' }))
  await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Obra-prima.')
  await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))
}

const movie = makeMovieRow({
  sk_movie_id: 'blue-beetle',
  titulo: 'Blue Beetle',
  ano_lancamento: 2023,
  duracao_minutos: 128,
  generos: ['Action', 'Science Fiction'],
  sinopse: 'Jaime Reyes ganha uma armadura alienígena.',
})

describe('MovieDetailPage', () => {
  it('mostra os dados do filme e a média das avaliações', async () => {
    seedDb({
      movies: [movie],
      reviews: [
        makeReviewRow({ sk_movie_id: 'blue-beetle', nota: 8 }),
        makeReviewRow({ sk_movie_id: 'blue-beetle', nota: 6 }),
      ],
    })
    renderApp('/filmes/blue-beetle')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Blue Beetle' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('2h 8min')).toBeInTheDocument()
    expect(screen.getByText('Science Fiction')).toBeInTheDocument()
    expect(screen.getByText('Jaime Reyes ganha uma armadura alienígena.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nota média 3,5 de 5' })).toBeInTheDocument()
    expect(screen.getByText('2 avaliações')).toBeInTheDocument()
  })

  it('mostra quem dirigiu o filme', async () => {
    seedDb({ movies: [{ ...movie, diretores: ['Lana Wachowski', 'Lilly Wachowski'] }] })
    renderApp('/filmes/blue-beetle')

    const names = await screen.findByText('Lana Wachowski e Lilly Wachowski')

    expect(names.parentElement).toHaveTextContent(/^Dirigido por Lana Wachowski e Lilly Wachowski$/)
  })

  it('não mostra a direção quando o filme não tem diretor', async () => {
    seedDb({ movies: [{ ...movie, diretores: [] }] })
    renderApp('/filmes/blue-beetle')

    await screen.findByRole('heading', { level: 1, name: 'Blue Beetle' })

    expect(screen.queryByText(/Dirigido por/)).not.toBeInTheDocument()
  })

  it('não mostra a duração quando ela é desconhecida (0 no CSV)', async () => {
    seedDb({ movies: [{ ...movie, duracao_minutos: 0 }] })
    renderApp('/filmes/blue-beetle')

    const year = await screen.findByText('2023')

    expect(year.parentElement).toHaveTextContent(/^2023$/)
  })

  it('lista as avaliações do filme, da mais recente para a mais antiga', async () => {
    seedDb({
      movies: [movie],
      reviews: [
        makeReviewRow({
          sk_movie_id: 'blue-beetle',
          nome: 'Primeira',
          created_at: '2026-09-01T10:00:00.000000',
        }),
        makeReviewRow({
          sk_movie_id: 'blue-beetle',
          nome: 'Última',
          created_at: '2026-09-20T10:00:00.000000',
        }),
      ],
    })
    renderApp('/filmes/blue-beetle')

    const section = await screen.findByRole('region', { name: 'Avaliações' })
    const reviews = await within(section).findAllByRole('article')

    expect(reviews.map((review) => within(review).getByText(/Primeira|Última/).textContent)).toEqual(
      ['Última', 'Primeira'],
    )
  })

  it('depois de avaliar, volta para a página do catálogo de onde abriu o filme', async () => {
    seedDb({
      movies: [
        ...Array.from({ length: CATALOG_PAGE_SIZE }, () => makeMovieRow()),
        movie,
      ],
    })
    const { user, router } = renderApp('/?pagina=2')

    await user.click(await screen.findByRole('link', { name: 'Blue Beetle' }))
    await screen.findByRole('heading', { level: 1, name: 'Blue Beetle' })
    await publishReview(user)

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?pagina=2')
    expect(db.reviews).toEqual([
      expect.objectContaining({ sk_movie_id: 'blue-beetle', nota: 10, comentario: 'Obra-prima.' }),
    ])
  })

  it('volta ao catálogo depois de avaliar um filme aberto pelas reviews populares', async () => {
    seedDb({
      movies: [movie],
      reviews: [makeReviewRow({ sk_movie_id: 'blue-beetle', curtidas: 3 })],
    })
    const { user, router } = renderApp('/')

    const popular = await screen.findByRole('region', { name: 'Reviews populares' })
    await user.click(await within(popular).findByRole('link', { name: 'Blue Beetle' }))
    await screen.findByRole('heading', { level: 1, name: 'Blue Beetle' })
    await publishReview(user)

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(db.reviews).toHaveLength(2)
  })

  it('aberto por link direto, volta ao início do catálogo depois de avaliar', async () => {
    seedDb({ movies: [movie] })
    const { user, router } = renderApp('/filmes/blue-beetle')
    await screen.findByRole('heading', { level: 1, name: 'Blue Beetle' })

    await publishReview(user)

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(db.reviews).toHaveLength(1)
  })

  it('o botão de voltar leva para a página do catálogo de onde abriu o filme', async () => {
    seedDb({
      movies: [
        ...Array.from({ length: CATALOG_PAGE_SIZE }, () => makeMovieRow()),
        movie,
      ],
    })
    const { user, router } = renderApp('/?pagina=2')

    await user.click(await screen.findByRole('link', { name: 'Blue Beetle' }))
    await user.click(await screen.findByRole('button', { name: 'Voltar ao catálogo' }))

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?pagina=2')
    expect(db.reviews).toHaveLength(0)
  })

  it('aberto por link direto, o botão de voltar leva ao início do catálogo', async () => {
    seedDb({ movies: [movie] })
    const { user, router } = renderApp('/filmes/blue-beetle')

    await user.click(await screen.findByRole('button', { name: 'Voltar ao catálogo' }))

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('avisa quando o filme não existe', async () => {
    renderApp('/filmes/nao-existe')

    expect(
      await screen.findByRole('heading', { name: 'Filme não encontrado.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
  })
})
