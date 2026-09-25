import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { server } from '../../../test/mocks/server'
import { renderWithProviders } from '../../../test/utils'
import { ReviewForm } from './ReviewForm'

const MOVIE_ID = 'blue-beetle'

function setup() {
  seedDb({ movies: [makeMovieRow({ sk_movie_id: MOVIE_ID })] })
  return renderWithProviders(<ReviewForm movieId={MOVIE_ID} />)
}

async function fillAndSubmit(user: ReturnType<typeof setup>['user']) {
  await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), 'Rafael')
  await user.click(screen.getByRole('radio', { name: '4 estrelas' }))
  await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Muito bom!')
  await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))
}

describe('ReviewForm', () => {
  it('tem um espaço para escrever a resenha', () => {
    setup()

    expect(screen.getByRole('textbox', { name: 'Resenha' }).tagName).toBe('TEXTAREA')
  })

  it('publica a avaliação com nome, nota e resenha', async () => {
    const { user } = setup()

    await fillAndSubmit(user)

    await screen.findByText('Avaliação publicada!')
    expect(screen.getByRole('status')).toHaveTextContent('Avaliação publicada!')
    expect(db.reviews).toEqual([
      expect.objectContaining({
        sk_movie_id: MOVIE_ID,
        nome: 'Rafael',
        nota: 8,
        comentario: 'Muito bom!',
      }),
    ])
  })

  it('limpa o formulário depois de publicar', async () => {
    const { user } = setup()

    await fillAndSubmit(user)

    await screen.findByText('Avaliação publicada!')
    expect(screen.getByRole('textbox', { name: 'Seu nome' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Resenha' })).toHaveValue('')
    expect(screen.getByRole('radio', { name: '4 estrelas' })).not.toBeChecked()
  })

  it('não envia sem nome, nota e resenha', async () => {
    const { user } = setup()

    await user.type(screen.getByRole('textbox', { name: 'Seu nome' }), '   ')
    await user.click(screen.getByRole('button', { name: 'Publicar avaliação' }))

    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Escolha uma nota.')).toBeInTheDocument()
    expect(screen.getByText('Escreva a resenha.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Seu nome' })).toHaveFocus()
    expect(db.reviews).toHaveLength(0)
  })

  it('conta os caracteres da resenha', async () => {
    const { user } = setup()

    await user.type(screen.getByRole('textbox', { name: 'Resenha' }), 'Muito bom!')

    expect(screen.getByText('10/4000')).toBeInTheDocument()
  })

  it('mostra o erro quando a API recusa a avaliação', async () => {
    server.use(
      http.post('/api/v1/movies/:movieId/reviews', () =>
        HttpResponse.json({ detail: 'Filme não encontrado.' }, { status: 404 }),
      ),
    )
    const { user } = setup()

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Filme não encontrado.')
    expect(screen.getByRole('textbox', { name: 'Resenha' })).toHaveValue('Muito bom!')
  })
})
