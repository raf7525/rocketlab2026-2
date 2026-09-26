import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../test/factories'
import { seedDb } from '../test/mocks/db'
import { renderApp } from '../test/utils'

describe('rotas', () => {
  it('avisa quando o endereço não existe', async () => {
    renderApp('/endereco-que-nao-existe')

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
  })

  it('mostra o botão de adicionar filme no catálogo', async () => {
    seedDb({ movies: [makeMovieRow({ titulo: 'Blue Beetle' })] })
    renderApp('/?busca=blue')

    expect(await screen.findByRole('link', { name: 'Adicionar filme' })).toHaveAttribute(
      'href',
      '/filmes/novo',
    )
  })

  it.each([
    ['na página do filme', '/filmes/blue-beetle', 'Blue Beetle'],
    ['na avaliação depois do cadastro', '/filmes/blue-beetle/avaliar', 'Blue Beetle'],
    ['no próprio cadastro', '/filmes/novo', 'Adicionar filme'],
  ])('esconde o botão de adicionar filme %s', async (_, path, heading) => {
    seedDb({ movies: [makeMovieRow({ sk_movie_id: 'blue-beetle', titulo: 'Blue Beetle' })] })
    renderApp(path)

    await screen.findByRole('heading', { level: 1, name: heading })
    expect(screen.queryByRole('link', { name: 'Adicionar filme' })).not.toBeInTheDocument()
  })
})
