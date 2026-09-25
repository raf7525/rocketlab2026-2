import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { renderWithProviders } from '../../../test/utils'
import { PopularReviews } from './PopularReviews'

function seedPopular() {
  seedDb({
    movies: [
      makeMovieRow({ sk_movie_id: 'resident-evil', titulo: 'Resident Evil', ano_lancamento: 2026 }),
    ],
    reviews: [
      makeReviewRow({
        sk_movie_id: 'resident-evil',
        nome: 'Ana Souza',
        nota: 8,
        comentario: 'Um clássico do terror.',
        curtidas: 10,
      }),
      makeReviewRow({
        sk_movie_id: 'resident-evil',
        nome: 'Bruno Lima',
        nota: 3,
        comentario: 'Não me convenceu.',
        curtidas: 32564,
      }),
    ],
  })
}

function likeButton(review: HTMLElement) {
  return within(review).getByRole('button', { name: /curtir/i })
}

describe('PopularReviews', () => {
  it('lista as reviews mais curtidas primeiro', async () => {
    seedPopular()
    renderWithProviders(<PopularReviews />)

    const reviews = await screen.findAllByRole('article')

    expect(reviews.map((review) => within(review).getByText(/Ana|Bruno/).textContent)).toEqual([
      'Bruno Lima',
      'Ana Souza',
    ])
  })

  it('mostra filme, ano, autor, nota, resenha e curtidas de cada review', async () => {
    seedPopular()
    renderWithProviders(<PopularReviews />)

    const [review] = await screen.findAllByRole('article')

    expect(within(review).getByRole('link', { name: 'Resident Evil' })).toHaveAttribute(
      'href',
      '/filmes/resident-evil',
    )
    expect(within(review).getByText('2026')).toBeInTheDocument()
    expect(within(review).getByText('Bruno Lima')).toBeInTheDocument()
    expect(within(review).getByRole('img', { name: '1,5 de 5 estrelas' })).toBeInTheDocument()
    expect(within(review).getByText('Não me convenceu.')).toBeInTheDocument()
    expect(likeButton(review)).toHaveTextContent('32.564 curtidas')
  })

  it('curtir soma uma curtida e curtir de novo desfaz', async () => {
    seedPopular()
    const { user } = renderWithProviders(<PopularReviews />)
    const [, review] = await screen.findAllByRole('article')
    expect(likeButton(review)).toHaveAttribute('aria-pressed', 'false')

    await user.click(likeButton(review))

    await waitFor(() => expect(likeButton(review)).toHaveTextContent('11 curtidas'))
    expect(likeButton(review)).toHaveAttribute('aria-pressed', 'true')
    expect(db.reviews.find((row) => row.nome === 'Ana Souza')?.curtidas).toBe(11)

    await user.click(likeButton(review))

    await waitFor(() => expect(likeButton(review)).toHaveTextContent('10 curtidas'))
    expect(likeButton(review)).toHaveAttribute('aria-pressed', 'false')
  })

  it('nunca mostra o botão marcado com a contagem antiga', async () => {
    seedPopular()
    const { user } = renderWithProviders(<PopularReviews />)
    const [, review] = await screen.findAllByRole('article')
    const seen: string[] = []
    const observer = new MutationObserver(() => {
      seen.push(`${likeButton(review).getAttribute('aria-pressed')}: ${likeButton(review).textContent}`)
    })
    observer.observe(review, { subtree: true, childList: true, attributes: true, characterData: true })

    await user.click(likeButton(review))
    await waitFor(() => expect(likeButton(review)).toHaveTextContent('11 curtidas'))
    observer.disconnect()

    expect(seen).not.toContain('true: Curtir 10 curtidas')
  })

  it('lembra das reviews curtidas ao voltar para a página', async () => {
    seedPopular()
    const first = renderWithProviders(<PopularReviews />)
    const [, review] = await screen.findAllByRole('article')
    await first.user.click(likeButton(review))
    await waitFor(() => expect(likeButton(review)).toHaveAttribute('aria-pressed', 'true'))
    first.unmount()

    renderWithProviders(<PopularReviews />)

    const [, again] = await screen.findAllByRole('article')
    expect(likeButton(again)).toHaveAttribute('aria-pressed', 'true')
    expect(likeButton(again)).toHaveTextContent('11 curtidas')
  })

  it('avisa quando ainda não há reviews', async () => {
    renderWithProviders(<PopularReviews />)

    expect(await screen.findByText('Nenhuma review por aqui ainda.')).toBeInTheDocument()
  })
})
