import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeMovieRow, makeReviewRow } from '../../../test/factories'
import { seedDb } from '../../../test/mocks/db'
import { renderApp } from '../../../test/utils'

const GENRES = ['Action', 'Drama', 'Science Fiction']

const matrix = makeMovieRow({
  titulo: 'The Matrix',
  generos: ['Action', 'Science Fiction'],
  diretores: ['Lana Wachowski', 'Lilly Wachowski'],
  elenco: ['Carrie-Anne Moss', 'Keanu Reeves'],
})
const reloaded = makeMovieRow({
  titulo: 'The Matrix Reloaded',
  generos: ['Action', 'Science Fiction'],
  diretores: ['Lana Wachowski', 'Lilly Wachowski'],
  elenco: ['Keanu Reeves', 'Monica Bellucci'],
})
const oppenheimer = makeMovieRow({
  titulo: 'Oppenheimer',
  generos: ['Drama'],
  diretores: ['Christopher Nolan'],
  elenco: ['Cillian Murphy', 'Emily Blunt'],
})
const dunkirk = makeMovieRow({
  titulo: 'Dunkirk',
  generos: ['Action', 'Drama'],
  diretores: ['Christopher Nolan'],
  elenco: ['Cillian Murphy', 'Tom Hardy'],
})

function seedCatalog() {
  seedDb({ genres: GENRES, movies: [matrix, reloaded, oppenheimer, dunkirk] })
}

function catalog() {
  return screen.getByRole('region', { name: 'Catálogo' })
}

async function shownTitles(): Promise<string[]> {
  const list = await within(catalog()).findByRole('list')
  return within(list)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent ?? '')
}

describe('Busca no catálogo', () => {
  it('busca filmes pelo título, sem diferenciar maiúsculas', async () => {
    seedCatalog()
    const { user, router } = renderApp('/')

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar pelo título' }), 'matrix')
    await user.keyboard('{Enter}')

    expect(await within(catalog()).findByText('2 filmes')).toBeInTheDocument()
    expect(await shownTitles()).toEqual(['The Matrix', 'The Matrix Reloaded'])
    expect(router.state.location.search).toBe('?busca=matrix')
  })

  it('filtra por gênero assim que ele é escolhido', async () => {
    seedCatalog()
    const { user, router } = renderApp('/')
    const genre = await screen.findByRole('combobox', { name: 'Gênero' })
    await within(genre).findByRole('option', { name: 'Drama' })

    await user.selectOptions(genre, 'Drama')

    expect(await within(catalog()).findByText('2 filmes')).toBeInTheDocument()
    expect(await shownTitles()).toEqual(['Oppenheimer', 'Dunkirk'])
    expect(router.state.location.search).toBe('?genero=Drama')
  })

  it('combina direção e elenco', async () => {
    seedCatalog()
    const { user } = renderApp('/')

    await user.type(await screen.findByRole('textbox', { name: 'Direção' }), 'nolan')
    await user.type(screen.getByRole('textbox', { name: 'Ator ou atriz' }), 'hardy')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await within(catalog()).findByText('1 filme')).toBeInTheDocument()
    expect(await shownTitles()).toEqual(['Dunkirk'])
  })

  it('abre com a busca do endereço já aplicada e preenchida', async () => {
    seedCatalog()
    renderApp('/?busca=matrix&genero=Action&ator=keanu')

    expect(await within(catalog()).findByText('2 filmes')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar pelo título' })).toHaveValue('matrix')
    expect(screen.getByRole('textbox', { name: 'Ator ou atriz' })).toHaveValue('keanu')
    expect(await screen.findByRole('combobox', { name: 'Gênero' })).toHaveValue('Action')
  })

  it('a paginação mantém a busca', async () => {
    seedDb({
      genres: GENRES,
      movies: Array.from({ length: 30 }, (_, i) => makeMovieRow({ titulo: `Star ${i + 1}` })),
    })
    const { user, router } = renderApp('/?busca=star')

    await user.click(await screen.findByRole('link', { name: 'Próxima página' }))

    expect(await screen.findByRole('link', { name: 'Star 25' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?busca=star&pagina=2')
  })

  it('uma busca nova começa da primeira página', async () => {
    seedDb({
      genres: GENRES,
      movies: Array.from({ length: 30 }, (_, i) => makeMovieRow({ titulo: `Star ${i + 1}` })),
    })
    const { user, router } = renderApp('/?pagina=2')

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar pelo título' }), 'star')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('link', { name: 'Star 1' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?busca=star')
  })

  it('avisa quando nada é encontrado e permite limpar a busca', async () => {
    seedCatalog()
    const { user, router } = renderApp('/?busca=xyz')

    expect(await screen.findByText('Nenhum filme encontrado.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Limpar busca' }))

    expect(await within(catalog()).findByText('4 filmes')).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
    expect(screen.getByRole('searchbox', { name: 'Buscar pelo título' })).toHaveValue('')
  })

  it('esconde as reviews populares durante a busca', async () => {
    seedDb({
      genres: GENRES,
      movies: [matrix],
      reviews: [makeReviewRow({ sk_movie_id: matrix.sk_movie_id })],
    })
    renderApp('/?busca=matrix')

    expect(await within(catalog()).findByText('1 filme')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Reviews populares' })).not.toBeInTheDocument()
  })
})
