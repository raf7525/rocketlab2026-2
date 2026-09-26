import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { renderApp } from '../../../test/utils'

describe('NewReviewPage', () => {
  it('mostra o filme e o formulário de avaliação', async () => {
    seedDb({
      movies: [
        makeMovieRow({
          sk_movie_id: 'matrix',
          titulo: 'Matrix',
          ano_lancamento: 1999,
          diretores: ['Lana Wachowski', 'Lilly Wachowski'],
        }),
      ],
    })
    renderApp('/filmes/matrix/avaliar')

    expect(await screen.findByRole('heading', { level: 1, name: 'Matrix' })).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
    expect(screen.getByText('Lana Wachowski e Lilly Wachowski')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Avaliar este filme' })).toBeInTheDocument()
  })

  it('aberta por link direto, volta ao início do catálogo depois de publicar', async () => {
    seedDb({ movies: [makeMovieRow({ sk_movie_id: 'matrix', titulo: 'Matrix' })] })
    const { user, router } = renderApp('/filmes/matrix/avaliar')

    await screen.findByRole('form', { name: 'Avaliar este filme' })
    await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), 'Rafael')
    await user.click(screen.getByRole('radio', { name: '5 estrelas' }))
    await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Obra-prima.')
    await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(await screen.findByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(db.reviews).toEqual([expect.objectContaining({ sk_movie_id: 'matrix', nota: 10 })])
  })

  it('avisa quando o filme não existe', async () => {
    seedDb({ movies: [] })
    renderApp('/filmes/nao-existe/avaliar')

    expect(await screen.findByRole('heading', { name: /não encontrado/i })).toBeInTheDocument()
  })
})
