import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { seedDb } from '../../../test/mocks/db'
import { renderApp } from '../../../test/utils'

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

  it('publicar uma avaliação atualiza a lista e a média', async () => {
    seedDb({ movies: [movie] })
    const { user } = renderApp('/filmes/blue-beetle')
    expect(await screen.findByText('Ninguém avaliou este filme ainda.')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), 'Rafael')
    await user.click(screen.getByRole('radio', { name: '5 estrelas' }))
    await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Obra-prima.')
    await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    const section = screen.getByRole('region', { name: 'Avaliações' })
    expect(await within(section).findByText('Obra-prima.')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: 'Nota média 5,0 de 5' })).toBeInTheDocument()
    expect(screen.getByText('1 avaliação')).toBeInTheDocument()
  })

  it('avisa quando o filme não existe', async () => {
    renderApp('/filmes/nao-existe')

    expect(
      await screen.findByRole('heading', { name: 'Filme não encontrado.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
  })
})
