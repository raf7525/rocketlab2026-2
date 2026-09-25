import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieSummary } from '../../../test/factories'
import { renderWithProviders } from '../../../test/utils'
import { MovieCard } from './MovieCard'

const movie = makeMovieSummary({
  sk_movie_id: 'blue-beetle',
  titulo: 'Blue Beetle',
  ano_lancamento: 2023,
  duracao_minutos: 128,
  generos: ['Action', 'Science Fiction'],
  qtd_avaliacoes_usuarios: 2,
  nota_media_usuarios: 7.25,
  estrelas_media: 3.5,
})

describe('MovieCard', () => {
  it('leva ao detalhe do filme', () => {
    renderWithProviders(<MovieCard movie={movie} />)

    expect(screen.getByRole('link', { name: 'Blue Beetle' })).toHaveAttribute(
      'href',
      '/filmes/blue-beetle',
    )
  })

  it('mostra as estrelas e a nota média logo abaixo do pôster', () => {
    renderWithProviders(<MovieCard movie={movie} />)

    expect(screen.getByRole('img', { name: 'Nota média 3,6 de 5' })).toHaveTextContent('★★★½')
    expect(screen.getByText('3,6')).toBeInTheDocument()
  })

  it('avisa quando o filme ainda não tem avaliações', () => {
    renderWithProviders(
      <MovieCard
        movie={{
          ...movie,
          qtd_avaliacoes_usuarios: 0,
          nota_media_usuarios: null,
          estrelas_media: null,
        }}
      />,
    )

    expect(screen.getByText('Sem avaliações')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /nota média/i })).not.toBeInTheDocument()
  })

  it('ao passar o mouse mostra ano, duração, avaliações e gêneros', async () => {
    const { user } = renderWithProviders(<MovieCard movie={movie} />)
    const link = screen.getByRole('link', { name: 'Blue Beetle' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.hover(link)

    const tooltip = screen.getByRole('tooltip')
    expect(within(tooltip).getByText('2023')).toBeInTheDocument()
    expect(within(tooltip).getByText('2h 8min · 2 avaliações')).toBeInTheDocument()
    expect(within(tooltip).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Action',
      'Science Fiction',
    ])

    await user.unhover(link)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('não mostra a duração quando ela é desconhecida (0 no CSV)', async () => {
    const { user } = renderWithProviders(<MovieCard movie={{ ...movie, duracao_minutos: 0 }} />)

    await user.hover(screen.getByRole('link', { name: 'Blue Beetle' }))

    expect(within(screen.getByRole('tooltip')).getByText('2 avaliações')).toBeInTheDocument()
  })

  it('também mostra os detalhes ao chegar pelo teclado', async () => {
    const { user } = renderWithProviders(<MovieCard movie={movie} />)

    await user.tab()

    expect(screen.getByRole('link', { name: 'Blue Beetle' })).toHaveFocus()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})
