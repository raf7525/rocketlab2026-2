import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow } from '../../../test/factories'
import { db, seedDb } from '../../../test/mocks/db'
import { renderApp } from '../../../test/utils'

const matrix = makeMovieRow({ sk_movie_id: 'matrix', titulo: 'The Matrix' })
const dune = makeMovieRow({ sk_movie_id: 'dune', titulo: 'Dune' })
const heat = makeMovieRow({ sk_movie_id: 'heat', titulo: 'Heat' })

function watchlist() {
  return screen.getByRole('region', { name: 'Watchlist' })
}

describe('Watchlist', () => {
  it('o botão ao lado de Adicionar filme abre a watchlist', async () => {
    seedDb({ movies: [matrix] })
    const { user, router } = renderApp('/')

    const add = await screen.findByRole('link', { name: 'Adicionar filme' })
    const link = screen.getByRole('link', { name: 'Watchlist' })
    expect(add.parentElement).toBe(link.parentElement)

    await user.click(link)

    expect(router.state.location.pathname).toBe('/watchlist')
    expect(await screen.findByRole('heading', { level: 1, name: 'Watchlist' })).toBeInTheDocument()
  })

  it('mostra os filmes guardados, do mais recente para o mais antigo', async () => {
    seedDb({ movies: [matrix, dune, heat], watchlist: ['heat', 'matrix'] })
    renderApp('/watchlist')

    const list = await within(await screen.findByRole('region', { name: 'Watchlist' })).findByRole(
      'list',
    )
    expect(
      within(list)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['The Matrix', 'Heat'])
    expect(within(watchlist()).getByText('2 filmes')).toBeInTheDocument()
  })

  it('avisa quando a watchlist está vazia', async () => {
    seedDb({ movies: [matrix] })
    renderApp('/watchlist')

    expect(await screen.findByText(/Nenhum filme na watchlist ainda/)).toBeInTheDocument()
  })

  it('o ícone de salvar do card guarda o filme na watchlist', async () => {
    seedDb({ movies: [matrix, dune] })
    const { user } = renderApp('/')
    const save = await screen.findByRole('button', { name: 'Salvar The Matrix na watchlist' })
    expect(save).toHaveAttribute('aria-pressed', 'false')

    await user.click(save)

    // O ícone muda na hora; o banco, quando a requisição termina.
    expect(save).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(db.watchlist).toEqual(['matrix']))

    await user.click(screen.getByRole('link', { name: 'Watchlist' }))
    expect(await within(watchlist()).findByRole('link', { name: 'The Matrix' })).toBeInTheDocument()
    expect(within(watchlist()).queryByRole('link', { name: 'Dune' })).not.toBeInTheDocument()
  })

  it('clicar de novo no ícone tira o filme da watchlist', async () => {
    seedDb({ movies: [matrix], watchlist: ['matrix'] })
    const { user } = renderApp('/')
    const save = await screen.findByRole('button', { name: 'Salvar The Matrix na watchlist' })
    expect(save).toHaveAttribute('aria-pressed', 'true')

    await user.click(save)

    expect(save).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(db.watchlist).toEqual([]))
  })

  it('tirar um filme na própria watchlist faz ele sumir da lista', async () => {
    seedDb({ movies: [matrix, dune], watchlist: ['matrix', 'dune'] })
    const { user } = renderApp('/watchlist')

    await user.click(
      await within(await screen.findByRole('region', { name: 'Watchlist' })).findByRole('button', {
        name: 'Salvar Dune na watchlist',
      }),
    )

    expect(await within(watchlist()).findByText('1 filme')).toBeInTheDocument()
    expect(within(watchlist()).queryByRole('link', { name: 'Dune' })).not.toBeInTheDocument()
  })

  it('a página do filme também tem o botão de salvar', async () => {
    seedDb({ movies: [matrix] })
    const { user } = renderApp('/filmes/matrix')
    const save = await screen.findByRole('button', { name: 'Watchlist' })
    expect(save).toHaveAttribute('aria-pressed', 'false')

    await user.click(save)

    // O ícone muda na hora; o banco, quando a requisição termina.
    expect(save).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(db.watchlist).toEqual(['matrix']))
  })
})
